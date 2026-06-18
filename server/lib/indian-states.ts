/** GST state codes (first two digits of GSTIN). */
export const INDIAN_STATE_NAMES: Record<string, string> = {
  '01': 'JAMMU AND KASHMIR',
  '02': 'HIMACHAL PRADESH',
  '03': 'PUNJAB',
  '04': 'CHANDIGARH',
  '05': 'UTTARAKHAND',
  '06': 'HARYANA',
  '07': 'DELHI',
  '08': 'RAJASTHAN',
  '09': 'UTTAR PRADESH',
  '10': 'BIHAR',
  '11': 'SIKKIM',
  '12': 'ARUNACHAL PRADESH',
  '13': 'NAGALAND',
  '14': 'MANIPUR',
  '15': 'MIZORAM',
  '16': 'TRIPURA',
  '17': 'MEGHALAYA',
  '18': 'ASSAM',
  '19': 'WEST BENGAL',
  '20': 'JHARKHAND',
  '21': 'ODISHA',
  '22': 'CHHATTISGARH',
  '23': 'MADHYA PRADESH',
  '24': 'GUJARAT',
  '26': 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
  '27': 'MAHARASHTRA',
  '28': 'ANDHRA PRADESH',
  '29': 'KARNATAKA',
  '30': 'GOA',
  '31': 'LAKSHADWEEP',
  '32': 'KERALA',
  '33': 'TAMIL NADU',
  '34': 'PUDUCHERRY',
  '35': 'ANDAMAN AND NICOBAR ISLANDS',
  '36': 'TELANGANA',
  '37': 'ANDHRA PRADESH',
  '38': 'LADAKH',
};

export function stateCodeFromGstin(gstin?: string | null): string | undefined {
  const value = String(gstin || '').trim().toUpperCase();
  if (value.length < 2 || !/^\d{2}/.test(value)) return undefined;
  return value.slice(0, 2);
}

export function stateNameFromCode(code?: string | null): string | undefined {
  if (!code) return undefined;
  const normalized = String(code).padStart(2, '0').slice(-2);
  return INDIAN_STATE_NAMES[normalized];
}

export function stateCodeFromName(name?: string | null): string | undefined {
  if (!name) return undefined;
  const normalized = String(name).trim().toUpperCase();
  if (/^\d{1,2}$/.test(normalized)) return normalized.padStart(2, '0');

  for (const [code, stateName] of Object.entries(INDIAN_STATE_NAMES)) {
    if (stateName === normalized || stateName.includes(normalized) || normalized.includes(stateName)) {
      return code;
    }
  }

  return undefined;
}

export function formatPlaceOfSupply(stateCode?: string | null): string | undefined {
  if (!stateCode) return undefined;
  const code = String(stateCode).padStart(2, '0').slice(-2);
  const name = INDIAN_STATE_NAMES[code];
  return name ? `${code}-${name}` : code;
}
