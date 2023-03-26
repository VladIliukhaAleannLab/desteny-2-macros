// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import BungieOAuthSDK from "@/lib/BungieOAuthSDK";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bungieOAuthSDK = new BungieOAuthSDK();
  const authorizationUrl = await bungieOAuthSDK.getAuthorizationUrl(
    "random_state"
  );
  res.status(200).redirect(authorizationUrl).end();
}
