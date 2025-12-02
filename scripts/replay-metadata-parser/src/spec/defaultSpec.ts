import type { MatchMetadataSpec } from "../types.js";

// Must match MatchMetadataConfig.wurst from island-troll-tribes
const ENCODE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:|._- \n";

// Order IDs from JASS/Wurst OrderIds for each SYMBOL_ORDER_STRING
// These get converted to hex strings by orderFormatter when read from replay
const ORDER_IDS = [
  852228, // darkconversion (A)
  852229, // darkportal (B)
  852219, // darkritual (C)
  852220, // darksummoning (D)
  852221, // deathanddecay (E)
  852222, // deathcoil (F)
  852223, // deathpact (G)
  852055, // defend (H)
  852015, // detectaoe (I)
  852145, // detonate (J)
  852104, // devour (K)
  852536, // devourmagic (L)
  852240, // disassociate (M)
  852495, // disenchant (N)
  852470, // dismount (O)
  852057, // dispel (P)
  852090, // divineshield (Q)
  852583, // doom (R)
  852487, // drain (S)
  852224, // dreadlordinferno (T)
  852001, // dropitem (U)
  852585, // drunkenhaze (V)
  852121, // earthquake (W)
  852146, // eattree (X)
  852586, // elementalfury (Y)
  852214, // wispharvest (Z)
  852108, // ensnareoff (a)
  852107, // ensnareon (b)
  852147, // entangle (c)
  852148, // entangleinstant (d)
  852171, // entanglingroots (e)
  852496, // etherealform (f)
  852105, // evileye (g)
  852230, // fingerofdeath (h)
  852174, // flamingarrows (i)
  852173, // flamingarrowstarg (j)
  852540, // flamingattack (k)
  852539, // flamingattacktarg (l)
  852060, // flare (m)
  852044, // forceboard (n)
  852176, // forceofnature (o)
  852587, // forkedlightning (p)
  852195, // freezingbreath (q)
  852561, // frenzy (r)
  852563, // frenzyoff (s)
  852562, // frenzyon (t)
  852225, // frostarmor (u)
  852459, // frostarmoroff (v)
  852458, // frostarmoron (w)
  851981, // getitem (x)
  852233, // gold2lumber (y)
  852511, // grabtree (z)
  852018, // harvest (0)
  852063, // heal (1)
  852109, // healingward (2)
  852501, // healingwave (3)
  852065, // healoff (4)
  852064, // healon (5)
  852502, // hex (6)
  852503, // voodoo (7)
  852092, // holybolt (8)
  852588, // howlofterror (9)
  851995, // humanbuild (:)
  852555, // impale (|)
  852670, // incineratearrow (.)
  852672, // incineratearrowoff (_)
  852671, // incineratearrowon (-)
  852232, // inferno ( )
  852066, // innerfire (\n)
];

// Convert order ID to hex string format that toOrderString produces
// WC3 stores as little-endian 4 bytes, toOrderString reverses then converts to hex
const orderIdToHexString = (orderId: number): string => {
  const bytes = [
    orderId & 0xff,
    (orderId >> 8) & 0xff,
    (orderId >> 16) & 0xff,
    (orderId >> 24) & 0xff,
  ];
  const reversed = bytes.reverse();
  return reversed.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const encodeChars = ENCODE_CHARS.split("");
const symbolOrderStrings = ORDER_IDS.map(orderIdToHexString);

export const DEFAULT_MATCH_METADATA_SPEC: MatchMetadataSpec = {
  version: 1,
  encoderUnitId: "hfoo",
  checksumModulo: 1_000_000_007,
  encodeChars,
  symbolOrderStrings,
};
