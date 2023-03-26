import * as axios from "axios";
import CONFIG from "@/lib/config";

const API_BASE_URL = "https://www.bungie.net/Platform";

export class BungieSDK {
  private readonly _accessToken: string;
  private membershipId: string = "";

  constructor(accessToken: string) {
    this._accessToken = accessToken;
  }

  private async _get(url: string) {
    const headers = {
      Authorization: `Bearer ${this._accessToken}`,
      "X-API-Key": CONFIG.apiKey,
    };
    return axios.default.get(url, { headers });
  }

  private async _post(url: string, data: any) {
    const headers = {
      Authorization: `Bearer ${this._accessToken}`,
      "Content-Type": "application/json",
      "X-API-Key": CONFIG.apiKey,
    };
    const response = await axios.default.post(url, data, { headers });
    return response.data;
  }

  private async _getMembershipId(): Promise<string> {
    if (this.membershipId) {
      return this.membershipId;
    }
    const getUrl = `${API_BASE_URL}/User/GetMembershipsForCurrentUser/`;
    const response = await this._get(getUrl);
    const membershipId =
      response.data.Response.destinyMemberships[0].membershipId;
    this.membershipId = membershipId;
    return membershipId;
  }

  // public async equipItem(characterId: string, item: IBungieEquippedItem) {
  //     const equipUrl = `${API_BASE_URL}/Destiny2/Actions/Items/EquipItem/`;
  //
  //     const headers: IBungieAuthHeaders = {
  //         Authorization: `Bearer ${this._accessToken}`,
  //         'Content-Type': 'application/json',
  //         'X-API-Key': '632de8c0f9924589b799235032b77762'
  //     };
  //
  //     const data = {
  //         itemId: "6917529880769099381",
  //         characterId: "2305843009574894475",
  //         membershipType: this._getMembershipType(),
  //     };
  //
  //     const response = await axios.default.post(equipUrl, data, { headers });
  //     return response.data;
  // }

  private _getMembershipType(): number {
    // Здесь вы должны вернуть тип членства, соответствующий вашему приложению
    // 1 - Xbox, 2 - PlayStation, 3 - Steam, 5 - Stadia, 10 - Demon
    return 3;
  }
  public async getCharacters() {
    const getUrl = `${API_BASE_URL}/Destiny2/${this._getMembershipType()}/Profile/${await this._getMembershipId()}/?components=characters`;
    const response = await this._get(getUrl);
    return Object.values(response.data.Response.characters.data);
  }

  public async getCharacter(id: string) {
    const getUrl = `${API_BASE_URL}/Destiny2/${this._getMembershipType()}/Profile/${await this._getMembershipId()}/Character/${id}/?components=0%2C100%2C101%2C102%2C103%2C201%2C200%2C500%2C402%2C400%2C401%2C308%2C307%2C306%2C305%2C303%2C304%2C302%2C300%2C301%2C205%2C204%2C202%2C203`;
    const response = await this._get(getUrl);
    return response.data.Response;
  }

  public async equipLoadout(characterId: string, loadoutIndex: string) {
    console.log(CONFIG)

    const postUrl = `${API_BASE_URL}/Destiny2/Actions/Loadouts/EquipLoadout/`;
    const data = {
      loadoutIndex: loadoutIndex,
      characterId: characterId,
      membershipType: this._getMembershipType(),
    };
    await this._post(postUrl, data);
  }
}

export default BungieSDK;
