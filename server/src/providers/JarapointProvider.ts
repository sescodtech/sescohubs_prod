import axios from 'axios';
import { IProvider, ProviderResponse } from './IProvider';

export class JarapointProvider implements IProvider {
  name = 'jarapoint';
  private baseUrl = 'https://www.jarapoint.com';

  private async getApiKey(tenantId: string): Promise<string> {
    // In a real app, this would fetch from the Tenant model in DB
    // For now, falling back to env for the main tenant
    return process.env.JARAPOINT_API_KEY || '';
  }

  private async getHeaders(tenantId: string) {
    const key = await this.getApiKey(tenantId);
    return {
      'Authorization': `Token ${key}`,
      'Content-Type': 'application/json'
    };
  }

  async getBalance(tenantId: string = 'default'): Promise<{ success: boolean, balance: number, error?: string }> {
    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.get(`${this.baseUrl}/api/balance/`, { headers });
      return { success: true, balance: parseFloat(r.data?.balance || 0) };
    } catch (e: any) {
      return { success: false, balance: 0, error: e.response?.data?.detail || e.message };
    }
  }

  async buyData({ planId, phone, network, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/api/data/`, {
        plan_id: planId,
        mobile_number: phone,
        Ported_number: true,
        reference: ref,
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful' || d.status === 'true' || d.success,
        reference: d.id || d.transaction_id,
        message: d.api_response || d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async buyAirtime({ network, phone, amount, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const networkIds: Record<string, number> = { mtn: 1, glo: 2, airtel: 3, '9mobile': 6 };
    const netId = networkIds[network.toLowerCase()];
    if (!netId) return { success: false, error: `Unknown network: ${network}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/api/topup/`, {
        network: netId,
        mobile_number: phone,
        amount,
        Ported_number: true,
        airtime_type: 'VTU',
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful' || d.status === 'true',
        reference: d.id || d.transaction_id,
        message: d.api_response || d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async buyCable({ provider, smartcard, planId, phone, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    const cableIds: Record<string, number> = { gotv: 1, dstv: 2, startimes: 3 };
    const cableId = cableIds[(provider || '').toLowerCase()];
    if (!cableId) return { success: false, error: `Unknown cable provider: ${provider}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/api/cablesub/`, {
        cabletv_name: cableId,
        smart_card_number: smartcard,
        plan: planId,
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful' || d.status === 'true',
        reference: d.id || d.transaction_id,
        message: d.api_response || d.message,
        data: d
      };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.detail || e.message, failReason: 'provider_error' };
    }
  }

  async buyElectricity({ disco, meter, amount, phone, ref }: any, tenantId: string = 'default'): Promise<ProviderResponse> {
    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/api/elect/`, {
        disco_name: disco,
        meter_no: meter,
        amount,
        MobileNumber: phone,
        meter_type: 'prepaid',
      }, { headers });
      const d = r.data;
      return {
        success: d.Status === 'successful' || d.status === 'true',
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
      const r = await axios.post(`${this.baseUrl}/api/result/`, {
        exam_name: examName.toUpperCase(),
        quantity,
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
    const networkIds: Record<string, number> = { mtn: 1, glo: 2, airtel: 3, '9mobile': 6 };
    const netId = networkIds[network.toLowerCase()];
    if (!netId) return { success: false, error: `Unknown network: ${network}`, failReason: 'invalid_params' };

    try {
      const headers = await this.getHeaders(tenantId);
      const r = await axios.post(`${this.baseUrl}/api/rechargepin/`, {
        network: netId,
        network_amount: amount,
        quantity,
        name_on_card: `SESCOHUBS ${network.toUpperCase()} ₦${amount}`,
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
    // This would normally call the Jarapoint API or return a static map
    // For now, we can port the JARA_PLANS map from the old project
    return [];
  }
}
