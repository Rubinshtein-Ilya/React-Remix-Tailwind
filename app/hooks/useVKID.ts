import { useEffect, useState } from "react";
import * as VKID from "@vkid/sdk";
import { generateVKIDParams } from "~/utils/vkid";
import { useEnv } from "~/contexts/EnvContext";
import { api } from "~/api/axios";

interface VKIDConfig {
  isInitialized: boolean;
  error: string | null;
}

export function useVKID() {
  const { VK_CLIENT_ID } = useEnv();
  const [config, setConfig] = useState<VKIDConfig>({
    isInitialized: false,
    error: null,
  });

  useEffect(() => {
    if (!VK_CLIENT_ID) {
      setConfig({
        isInitialized: false,
        error: "VK_CLIENT_ID не найден в переменных окружения",
      });
      return;
    }

    const initVKID = async () => {
      try {
        const { codeVerifier, codeChallenge, state } =
          await generateVKIDParams();

        // Сохраняем codeVerifier для дальнейшего использования при обмене кода на токен
        sessionStorage.setItem("vk_code_verifier", codeVerifier);
        sessionStorage.setItem("vk_state", state);

        VKID.Config.init({
          app: Number(VK_CLIENT_ID),
          redirectUrl: "https://fansdream.ru",
          state: state,
          codeVerifier: codeVerifier,
          responseMode: VKID.ConfigResponseMode.Callback,
          scope: "vkid.personal_info email phone",
        });

        setConfig({
          isInitialized: true,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Неизвестная ошибка";
        console.error("Ошибка инициализации VK ID SDK:", error);
        setConfig({
          isInitialized: false,
          error: errorMessage,
        });
      }
    };

    initVKID();
  }, [VK_CLIENT_ID]);

  return config;
}
