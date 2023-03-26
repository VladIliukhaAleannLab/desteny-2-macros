// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import BungieOAuthSDK from "@/lib/BungieOAuthSDK";
import { withSessionRoute } from "@/lib/session";
export default withSessionRoute(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bungieOAuthSDK = new BungieOAuthSDK();
  await bungieOAuthSDK.getAccessToken(req, res);
  res.status(200).redirect("/").end();
});
