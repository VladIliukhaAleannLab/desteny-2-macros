// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import BungieSDK from "@/lib/BungieSDK";
import { withSessionRoute } from "@/lib/session";
import BungieOAuthSDK from "@/lib/BungieOAuthSDK";

export default withSessionRoute(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const characterId = req.query.characterId as string;
  const loadoutIndex = req.query.loadoutIndex as string;
  const bungieOAuthSDK = new BungieOAuthSDK();
  const accessToken = await bungieOAuthSDK.getAccessToken(req, res);
  if (!accessToken) {
    return res.status(401).end();
  }
  const sdk = new BungieSDK(accessToken);
  await sdk.equipLoadout(characterId, loadoutIndex);
  return res.status(200).end();

});
