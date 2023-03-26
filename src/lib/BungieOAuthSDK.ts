import * as querystring from "querystring";
import * as axios from "axios";
import { Session, Token } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import CONFIG from "@/lib/config";
import Config from "@/lib/config";

const API_BASE_URL = "https://www.bungie.net/Platform";
const AUTH_BASE_URL = "https://www.bungie.net/en/OAuth/Authorize";
const TOKEN_BASE_URL = "https://www.bungie.net/platform/app/oauth/token/";

interface IBungieOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class BungieOAuthSDK {
  private _config: IBungieOAuthConfig;

  constructor(config: IBungieOAuthConfig = CONFIG) {
    this._config = config;
  }

  public async getAuthorizationUrl(state: string): Promise<string> {
    const params = querystring.stringify({
      response_type: "code",
      client_id: this._config.clientId,
      redirect_uri: this._config.redirectUri,
      state: state,
    });

    return `${AUTH_BASE_URL}?${params}`;
  }

  public async getAccessToken(req: NextApiRequest, res: NextApiResponse) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${this._getBase64EncodedCredentials()}`,
    };

    const session = req.session;
    if (session.token) {
      const endTime = session.token.expires_in * 60 * 1000 + session.token.set_time;
      if (new Date().getTime() < endTime) {
        return session.token.access_token;
      } else {
        const endRefreshTime =
          session.token.refresh_expires_in * 60 * 1000 + session.token.set_time;
        if (new Date().getTime() < endRefreshTime) {
          const data = querystring.stringify({
            grant_type: "refresh_token",
            refresh_token: session.token.refresh_token,
            "X-API-Key": Config.apiKey,
          });

          const response = await axios.default.post(TOKEN_BASE_URL, data, {
            headers,
          });
          await this._saveToken(response.data, session);
          return response.data.access_token;
        } else {
          await this._deleteToken(session);
          res.redirect(CONFIG.redirectUri).end();
          return null;
        }
      }
    }

    const code = req.query.code as string;

    if (!code) {
      res.redirect(CONFIG.redirectUri).end();
      return null;
    }

    const data = querystring.stringify({
      grant_type: "authorization_code",
      code: code,
    });

    const response = await axios.default.post(TOKEN_BASE_URL, data, {
      headers,
    });
    await this._saveToken(response.data, session);
    return response.data.access_token;
  }

  private _getBase64EncodedCredentials(): string {
    const credentials = `${this._config.clientId}:${this._config.clientSecret}`;
    const buffer = Buffer.from(credentials, "utf8");
    return buffer.toString("base64");
  }

  private async _saveToken(token: Token, session: Session) {
    session.token = {
      ...token,
      set_time: new Date().getTime(),
    };
    await session.save();
  }

  private async _deleteToken(session: Session) {
    session.token = undefined;
    await session.save();
  }
}

export default BungieOAuthSDK;
