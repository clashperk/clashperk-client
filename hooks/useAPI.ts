import { authCookieKey } from '@/lib/constants';
import { getCookie, setCookie } from 'cookies-next';
import { GuildClansAggregated } from './types';

export const useAPI = () => {
  const login = async (email: string, password: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    setCookie(authCookieKey, data.accessToken);

    return data;
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    setCookie(authCookieKey, data.accessToken);

    return data;
  };

  const testToken = async () => {
    const accessToken = getCookie(authCookieKey);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  };

  const uploadFile = async (formData: FormData) => {
    const accessToken = getCookie(authCookieKey);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }

    return {
      url: `${data.url}?v=${Date.now()}`
    };
  };

  const getClans = async ({ guildId }: { guildId: string }) => {
    const accessToken = getCookie(authCookieKey);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/guilds/${guildId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }

    return data as GuildClansAggregated;
  };

  return { login, signup, testToken, uploadFile, getClans };
};
