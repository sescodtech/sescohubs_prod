import axios from 'axios';
import { IProvider, ProviderResponse } from './IProvider';

export class GladTidingsProvider implements IProvider {
  name = 'gladtidings';
  private baseUrl = 'https://www.gladtidingsdata.com/api';

  private async getApiKey(tenantId: string): Promise<string> {
    return process.env.GLADTIDINGS_API_KEY || '';
  }

  private async getHeaders(tenantId: string) {
    const key = await this.getApiKey(tenantId);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${key}`
    };
  }

  async getBalance(tenantId: string = 'default'): Promise<{ success: boolean, balance: number, error?: string }> {
    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.get(`${this.baseUrl}/user/`, { headers });
      const data = r.data;
      const balance = parseFloat(data.user?.wallet_balance || data.user?.Account_Balance || data.wallet_balance || data.Account_Balance || data.balance || 0);
      return { success: true, balance };
    } catch (e: any) {
      return { success: false, balance: 0, error: e.response?.data?.detail || e.message };
    }
  }

  async buyData({ planId, phone, network, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const networkMap: Record<string, number> = { mtn: 1, glo: 2, airtel: 3, '9mobile': 6 };
    const netId = networkMap[network.toLowerCase()];
    if (!netId) return { success: false, error: `Unknown network: ${network}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/data/`, {
        network: netId,
        mobile_number: phone,
        plan: planId,
        Ported_number: true,
        ref: ref,
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful' || d.status === 'successful',
        reference: d.id || d.ident,
        message: d.api_response || d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async buyAirtime({ network, phone, amount, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const networkMap: Record<string, number> = { mtn: 1, glo: 2, airtel: 3, '9mobile': 6 };
    const netId = networkMap[network.toLowerCase()];
    if (!netId) return { success: false, error: `Unknown network: ${network}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/topup/`, {
        network: netId,
        mobile_number: phone,
        Ported_number: true,
        airtime_type: 'VTU',
        amount: Number(amount),
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful' || d.status === 'successful',
        reference: d.id,
        message: d.api_response || d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async buyCable({ provider, smartcard, planId, phone, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const cableMap: Record<string, number> = { gotv: 1, dstv: 2, startimes: 3 };
    const cableId = cableMap[(provider || '').toLowerCase()];
    if (!cableId) return { success: false, error: `Unknown cable provider: ${provider}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/cablesub/`, {
        cabletv_name: cableId,
        smart_card_number: smartcard,
        plan: planId,
        phone: phone,
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful' || d.status === 'successful',
        reference: d.id,
        message: d.api_response || d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async buyElectricity({ disco, meter, amount, phone, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const discoMap: Record<string, number> = { ikeja: 18, ibadan: 19, eko: 20, 'port harcourt': 21, kaduna: 22, kano: 23, jos: 24, abuja: 25, enugu: 26, yola: 28, benin: 29 };
    const discoId = discoMap[(disco || '').toLowerCase()];
    if (!discoId) return { success: false, error: `Unknown disco: ${disco}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/v2/billpayment/`, {
        disco_id: discoId,
        meter_number: meter,
        amount: Number(amount),
        meter_type: 'prepaid',
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful' || d.status === 'successful',
        reference: d.id,
        message: d.api_response || d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async buyExamPin({ examName, quantity, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/epin/`, {
        exam_name: examName.toUpperCase(),
        quantity: Number(quantity),
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful',
        reference: d.id,
        message: d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async buyRechargeCard({ network, amount, quantity, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const networkMap: Record<string, number> = { mtn: 1, glo: 2, airtel: 3, '9mobile': 6 };
    const netId = networkMap[network.toLowerCase()];
    if (!netId) return { success: false, error: `Unknown network: ${network}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/rechargepin/`, {
        network: netId,
        amount: Number(amount),
        quantity: Number(quantity),
        name_on_card: 'SESCOHUBS',
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful',
        reference: d.id,
        message: d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async getAllPlans(): Promise<any[]> {
    return [];
  }
}
