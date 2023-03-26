// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import BungieSDK from "@/lib/BungieSDK";
import { withSessionRoute } from "@/lib/session";
import BungieOAuthSDK from "@/lib/BungieOAuthSDK";

export default withSessionRoute(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bungieOAuthSDK = new BungieOAuthSDK();
  const accessToken = await bungieOAuthSDK.getAccessToken(req, res);

  if (!accessToken) {
    return
  }

  const sdk = new BungieSDK(accessToken);
  const characters = await sdk.getCharacters();
  return res.status(200).json({
    characters,
  });
});
