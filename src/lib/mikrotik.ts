import { RouterOSAPI } from "node-routeros";

interface MikroTikConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export class MikroTikClient {
  private config: MikroTikConfig;

  constructor(config: MikroTikConfig) {
    this.config = config;
  }

  private async connect(): Promise<RouterOSAPI> {
    const api = new RouterOSAPI({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      timeout: 10,
    });
    await api.connect();
    return api;
  }

  async testConnection(): Promise<boolean> {
    try {
      const api = await this.connect();
      await api.close();
      return true;
    } catch {
      return false;
    }
  }

  async getHotspotUsers(): Promise<Record<string, string>[]> {
    const api = await this.connect();
    try {
      const users = await api.write("/ip/hotspot/user/print");
      return users as Record<string, string>[];
    } finally {
      await api.close();
    }
  }

  async addHotspotUser(
    username: string,
    password: string,
    profile?: string,
    limitUptime?: string,
    limitBytesTotal?: string
  ): Promise<void> {
    const api = await this.connect();
    try {
      const params: string[] = [
        `/ip/hotspot/user/add`,
        `=name=${username}`,
        `=password=${password}`,
      ];
      if (profile) params.push(`=profile=${profile}`);
      if (limitUptime) params.push(`=limit-uptime=${limitUptime}`);
      if (limitBytesTotal)
        params.push(`=limit-bytes-total=${limitBytesTotal}`);
      await api.write(params);
    } finally {
      await api.close();
    }
  }

  async removeHotspotUser(username: string): Promise<void> {
    const api = await this.connect();
    try {
      const users = await api.write([
        "/ip/hotspot/user/print",
        `?name=${username}`,
      ]);
      const user = (users as Record<string, string>[])[0];
      if (user?.[".id"]) {
        await api.write(["/ip/hotspot/user/remove", `=.id=${user[".id"]}`]);
      }
    } finally {
      await api.close();
    }
  }

  async getActiveSessions(): Promise<Record<string, string>[]> {
    const api = await this.connect();
    try {
      const sessions = await api.write("/ip/hotspot/active/print");
      return sessions as Record<string, string>[];
    } finally {
      await api.close();
    }
  }

  async disconnectUser(sessionId: string): Promise<void> {
    const api = await this.connect();
    try {
      await api.write(["/ip/hotspot/active/remove", `=.id=${sessionId}`]);
    } finally {
      await api.close();
    }
  }

  async getHotspotProfiles(): Promise<Record<string, string>[]> {
    const api = await this.connect();
    try {
      const profiles = await api.write(
        "/ip/hotspot/user/profile/print"
      );
      return profiles as Record<string, string>[];
    } finally {
      await api.close();
    }
  }

  async createHotspotProfile(
    name: string,
    rateLimit?: string,
    sessionTimeout?: string,
    sharedUsers?: number
  ): Promise<void> {
    const api = await this.connect();
    try {
      const params: string[] = [
        `/ip/hotspot/user/profile/add`,
        `=name=${name}`,
      ];
      if (rateLimit) params.push(`=rate-limit=${rateLimit}`);
      if (sessionTimeout) params.push(`=session-timeout=${sessionTimeout}`);
      if (sharedUsers) params.push(`=shared-users=${sharedUsers}`);
      await api.write(params);
    } finally {
      await api.close();
    }
  }

  async getSystemInfo(): Promise<Record<string, string>> {
    const api = await this.connect();
    try {
      const info = await api.write("/system/resource/print");
      return (info as Record<string, string>[])[0] ?? {};
    } finally {
      await api.close();
    }
  }
}
