import axios from 'axios';
import { IProvider, ProviderResponse } from './IProvider';

export class CheapDataHubProvider implements IProvider {
  name = 'cheapdatahub';
  private baseUrl = 'https://www.cheapdatahub.ng/api/v1/resellers';

  private async getApiKey(tenantId: string): Promise<string> {
    return process.env.CHEAPDATAHUB_API_KEY || '';
  }

  private async getHeaders(tenantId: string) {
    const key = await this.getApiKey(tenantId);
    return {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async getBalance(tenantId: string = 'default'): Promise<{ success: boolean, balance: number, error?: string }> {
    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.get(`${this.baseUrl}/wallet/balance/`, { headers });
      const data = r.data;
      if (data.status === 'true' || data.status === true) {
        return { success: true, balance: parseFloat(data.data?.balance ?? 0) };
      }
      return { success: false, balance: 0, error: data.message || 'Balance fetch failed' };
    } catch (e: any) {
      return { success: false, balance: 0, error: e.response?.data?.message || e.message };
    }
  }

  async buyData({ planId, phone, network, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/data/purchase/`, {
        bundle_id: Number(planId),
        phone_number: phone,
        reference: ref,
      }, { headers });
      const d = r.data;
      return {
        success: d.status === 'true' || d.status === true,
        reference: d.transaction_id || d.reference,
        message: d.message || (d.status === 'true' ? 'Data purchased' : 'Data purchase failed'),
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || e.message, failReason: 'provider_error' };
    }
  }

  async buyAirtime({ network, phone, amount, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const networkMap: Record<string, number> = { mtn: 1, glo: 2, airtel: 3, '9mobile': 4 };
    const netId = networkMap[network.toLowerCase()];
    if (!netId) return { success: false, error: `Unknown network: ${network}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/airtime/purchase/`, {
        provider_id: netId,
        phone_number: phone,
        amount: Number(amount),
      }, { headers });
      const d = r.data;
      return {
        success: d.status === 'true' || d.status === true,
        reference: d.transaction_id || d.reference,
        message: d.message || (d.status === 'true' ? 'Airtime delivered' : 'Airtime failed'),
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || e.message, failReason: 'provider_error' };
    }
  }

  async buyCable({ provider, smartcard, planId, phone, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const cableMap: Record<string, number> = { gotv: 1, dstv: 2, startimes: 3 };
    const cableId = cableMap[(provider || '').toLowerCase()];
    if (!cableId) return { success: false, error: `Unknown cable provider: ${provider}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/cable/purchase/`, {
        cable_id: cableId,
        smart_card_number: smartcard,
        plan_id: planId,
        phone_number: phone,
      }, { headers });
      const d = r.data;
      return {
        success: d.status === 'true' || d.status === true,
        reference: d.transaction_id || d.reference,
        message: d.message || (d.status === 'true' ? 'Cable subscription processed' : 'Cable subscription failed'),
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || e.message, failReason: 'provider_error' };
    }
  }

  async buyElectricity({ disco, meter, amount, phone, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const discoMap: Record<string, number> = { aedc: 1, ekedc: 2, ibedc: 3, ikedc: 4, kaduna: 5, phed: 6, jos: 7, enugu: 8, yola: 9, benin: 10 };
    const discoId = discoMap[(disco || '').toLowerCase()];
    if (!discoId) return { success: false, error: `Unknown disco: ${disco}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/electricity/purchase/`, {
        disco: discoId,
        meter_number: meter,
        amount: Number(amount),
        phone_number: phone,
        meter_type: 'prepaid',
      }, { headers });
      const d = r.data;
      return {
        success: d.status === 'true' || d.status === true,
        reference: d.transaction_id || d.reference,
        message: d.message || (d.status === 'true' ? 'Electricity token generated' : 'Electricity purchase failed'),
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || e.message, failReason: 'provider_error' };
    }
  }

  async buyExamPin({ examName, quantity, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/exam-pin/purchase/`, {
        product_id: examName,
        quantity,
      }, { headers });
      const d = r.data;
      return {
        success: d.status === 'true' || d.status === true,
        reference: d.transaction_id,
        message: d.message || (d.status === 'true' ? 'Exam pin purchased' : 'Exam pin failed'),
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || e.message, failReason: 'provider_error' };
    }
  }

  async buyRechargeCard({ network, amount, quantity, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const networkMap: Record<string, number> = { mtn: 1, glo: 2, airtel: 3, '9mobile': 4 };
    const netId = networkMap[network.toLowerCase()];
    if (!netId) return { success: false, error: `Unknown network: ${network}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/airtime/purchase/`, {
        provider_id: netId,
        phone_number: phone, // Not provided in params, but required by CDH
        amount: Number(amount),
      }, { headers });
      const d = r.data;
      return {
        success: d.status === 'true' || d.status === true,
        reference: d.transaction_id || d.reference,
        message: d.message || (d.status === 'true' ? 'Airtime delivered' : 'Airtime failed'),
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || e.message, failReason: 'provider_error' };
    }
  }

  async getAllPlans(): Promise<any[]> {
    return [];
  }
}
