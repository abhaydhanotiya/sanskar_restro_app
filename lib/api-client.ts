// API client for making HTTP requests

const API_BASE = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Tables
  async getTables() {
    return this.request('/tables');
  }

  async getTable(id: number) {
    return this.request(`/tables/${id}`);
  }

  async updateTable(id: number, updates: any) {
    return this.request(`/tables/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async createTable(table: any) {
    return this.request('/tables', {
      method: 'POST',
      body: JSON.stringify(table),
    });
  }

  async deleteTable(id: number) {
    return this.request(`/tables/${id}`, {
      method: 'DELETE',
    });
  }

  // Menu
  async getMenu() {
    return this.request('/menu');
  }

  async updateMenuItem(id: number, updates: any) {
    return this.request(`/menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async createMenuItem(item: any) {
    return this.request('/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async deleteMenuItem(id: number) {
    return this.request(`/menu/${id}`, {
      method: 'DELETE',
    });
  }

  // Rooms
  async getRooms() {
    return this.request('/rooms');
  }

  async updateRoom(id: number, updates: any) {
    return this.request(`/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async createRoom(room: any) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    });
  }

  async deleteRoom(id: number) {
    return this.request(`/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions
  async getTransactions() {
    return this.request('/transactions');
  }

  async createTransaction(transaction: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // Staff
  async getStaff() {
    return this.request('/staff');
  }

  // Attendance
  async getAttendance() {
    return this.request('/attendance');
  }

  async createAttendanceRecord(record: any) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  async updateAttendanceRecord(recordId: number, updates: any) {
    return this.request('/attendance', {
      method: 'PATCH',
      body: JSON.stringify({ recordId, updates }),
    });
  }

  // Shift Management
  async startShift(userId: number) {
    return this.request('/shift/start', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async endShift(userId: number) {
    return this.request('/shift/end', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getShiftStatus(userId: number) {
    return this.request(`/shift/status?userId=${userId}`);
  }

  // Auth
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }
}

export const apiClient = new ApiClient();
