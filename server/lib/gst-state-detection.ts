import { stateCodeFromName, stateNameFromCode } from './indian-states.js';
import { UNKNOWN_STATE_CODE, UNKNOWN_STATE_NAME } from './gst-company-defaults.js';

type Row = Record<string, unknown>;

function pickString(source: Row, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return undefined;
}

function parseStateFromAddress(address?: string): { stateName?: string; stateCode?: string } {
  if (!address) return {};
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const part = parts[i];
    if (!part || part.toLowerCase() === 'india') continue;
    const code = stateCodeFromName(part);
    if (code) {
      return { stateName: stateNameFromCode(code) || part, stateCode: code };
    }
  }
  return {};
}

export function detectCustomerState(
  invoice: Row,
  order?: Row | null,
): { stateName: string; stateCode: string; source: string } {
  const existingCode = pickString(invoice, ['customer_state_code']);
  const existingName = pickString(invoice, ['customer_state']);
  if (existingCode && existingCode !== UNKNOWN_STATE_CODE) {
    return {
      stateName: existingName || stateNameFromCode(existingCode) || existingCode,
      stateCode: existingCode.padStart(2, '0').slice(-2),
      source: 'invoice',
    };
  }

  const billingState = pickString(invoice, ['billing_state']);
  if (billingState) {
    const code = stateCodeFromName(billingState);
    if (code) {
      return { stateName: billingState, stateCode: code, source: 'billing_state' };
    }
  }

  const fromAddress = parseStateFromAddress(pickString(invoice, ['billing_address']));
  if (fromAddress.stateCode) {
    return {
      stateName: fromAddress.stateName || fromAddress.stateCode,
      stateCode: fromAddress.stateCode,
      source: 'billing_address',
    };
  }

  const metadata = (order?.metadata as Row | undefined) || {};
  const snapshot = (metadata.formSnapshot as Row | undefined) || metadata;
  const snapshotState = pickString(snapshot, [
    'customerState',
    'currentState',
    'officeState',
    'billing_state',
  ]);
  const snapshotCode = pickString(snapshot, ['customerStateCode', 'stateCode']);
  if (snapshotCode) {
    return {
      stateName: snapshotState || stateNameFromCode(snapshotCode) || snapshotCode,
      stateCode: snapshotCode.padStart(2, '0').slice(-2),
      source: 'order_snapshot',
    };
  }
  if (snapshotState) {
    const code = stateCodeFromName(snapshotState);
    if (code) {
      return { stateName: snapshotState, stateCode: code, source: 'order_snapshot' };
    }
  }

  const pob = pickString(snapshot, ['pob', 'placeOfBirth']);
  if (pob) {
    const fromPob = parseStateFromAddress(pob);
    if (fromPob.stateCode) {
      return {
        stateName: fromPob.stateName || fromPob.stateCode,
        stateCode: fromPob.stateCode,
        source: 'place_of_birth',
      };
    }
  }

  const profileState = pickString(invoice, ['customer_profile_state', 'user_profile_state']);
  if (profileState) {
    const code = stateCodeFromName(profileState);
    if (code) {
      return { stateName: profileState, stateCode: code, source: 'profile' };
    }
  }

  return { stateName: UNKNOWN_STATE_NAME, stateCode: UNKNOWN_STATE_CODE, source: 'unknown' };
}
