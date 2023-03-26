import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from "next";
const sessionOptions = {
  password: "DtTEqKkeamLnuYKFNEYuSWrSHMhqPmau",
  cookieName: "session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

const serialize = function(obj, prefix) {
  const str = [];
  for (const p in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(p)) {
      const k = prefix ? `${ prefix }[${ p }]` : p;
      const v = obj[p];
      str.push(v !== null && typeof v === "object"
          ? serialize(v, k)
          : `${ encodeURIComponent(k) }=${ encodeURIComponent(v) }`);
    }
  }
  return str.join("&");
};


export default function getPathWithQuery(path, query) {
  const queryString = serialize(query).toString();

  if (queryString) return `${path}?${queryString}`;

  return path;
}

export async function getAccessToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return { accessToken: req.session.token!.access_token };
}

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  return withIronSessionSsr(handler, sessionOptions);
}

export function withAuthSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  return withSessionSsr(async (ctx: GetServerSidePropsContext) => {
    if (!ctx.req.session.token) {
      return {
        redirect: {
          destination: getPathWithQuery("/api/authorization/handle", ctx.query),
          permanent: false,
        },
      };
    }

    return handler(ctx);
  });
}

export type Token = {
  access_token: string;
  token_type: string;
  expires_in: number; // 3600
  refresh_token: string;
  refresh_expires_in: number; // 7776000,
  membership_id: string;
  set_time: number;
};

export type Session = {
  token?: Token;
  save: () => Promise<void>;
};

declare module "iron-session" {
  interface IronSessionData {
    token?: Token;
  }
}
