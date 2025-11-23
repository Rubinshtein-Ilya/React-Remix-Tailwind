import React, { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import HeartIcon from "../icons/HeartIcon";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/queries/auth";
import { useLikeItem, useUnlikeItem } from "~/queries/user";
import { useNotifications } from "~/hooks/useNotifications";
import clsx from "clsx";

interface LikeButtonProps {
  sourceId: string;
  type: "team" | "player" | "item" | "event";
  isLiked?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  iconColors?: {
    liked: string;
    unliked: string;
  };
}

export function LikeButton({
  sourceId,
  type,
  isLiked = false,
  className = "",
  size = "md",
  iconColors = {
    liked: "#ef4444",
    unliked: "#fff",
  },
}: LikeButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const notifications = useNotifications();
  const [liked, setLiked] = useState(isLiked);
  const [justLiked, setJustLiked] = useState(false);

  // Синхронизируем внутреннее состояние с пропсом isLiked
  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const likeMutation = useLikeItem();
  const unlikeMutation = useUnlikeItem();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Проверяем авторизацию
      if (!user) {
        notifications.showError(
          t("auth.login_required_for_favorites", "Чтобы добавлять товары в избранное, пожалуйста, зарегистрируйтесь или войдите в аккаунт.")
        );
        return;
      }

      if (liked) {
        unlikeMutation.mutate(sourceId, {
          onSuccess: () => {
            setLiked(false);
          },
          onError: (error) => {
            console.error("Error unliking item:", error);
          },
        });
      } else {
        likeMutation.mutate(
          { sourceId, type },
          {
            onSuccess: () => {
              setLiked(true);
              setJustLiked(true);
              // Убираем анимацию через 300ms
              setTimeout(() => setJustLiked(false), 300);
            },
            onError: (error) => {
              console.error("Error liking item:", error);
            },
          }
        );
      }
    },
    [liked, likeMutation, unlikeMutation, user, notifications, t, sourceId, type]
  );

  const sizeConfig = {
    sm: { button: "w-6 h-6", icon: { width: 14, height: 14 } },
    md: { button: "w-6 h-6", icon: { width: 14, height: 14 } },
    lg: { button: "w-8 h-8", icon: { width: 18, height: 18 } },
  };

  const config = sizeConfig[size];

  return (
    <button
      onClick={handleClick}
      disabled={likeMutation.isPending || unlikeMutation.isPending}
      className={clsx(
        "z-1 flex items-center justify-center rounded-full aspect-square bg-[var(--bg-dark)] transition-all duration-200",
        "enabled:hover:scale-105 enabled:hover:shadow-lg enabled:hover:shadow-black/20 enabled:active:scale-105",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        liked ? "focus:ring-red-500" : "focus:ring-[#F9B234]",
        config.button,
        className
      )}
      title={
        liked
          ? t("common.unlike", "Убрать из избранного")
          : t("common.like", "Добавить в избранное")
      }
    >
      <div
        className={clsx(
          "transition-transform duration-300",
          justLiked && "animate-pulse scale-125"
        )}
      >
        <HeartIcon
          width={config.icon.width}
          height={config.icon.height}
          color={iconColors.unliked}
          filled={liked}
        />
      </div>
    </button>
  );
}
