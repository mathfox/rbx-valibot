import RegExp from "@rbxts/regexp";

/**
 * Email regex.
 */
//export const EMAIL_REGEX = RegExp("^[a-zA-Z0-9_.]+[@]{1}[a-z0-9]+[.][a-z]+$", "m");
export const EMAIL_REGEX = RegExp("^(?!.)(?:.?[w+]++)++@(?!.)(?:.?(?:xn--)?(?!-|.*--)[a-zA-Z0-9-]++(?<!-)){2,}$", "m");

/**
 * [Hex color](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet) regex.
 */
export const HEX_COLOR_REGEX = RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$", "m");

/**
 * [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) regex.
 */
export const UUID_REGEX = RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", "m");
