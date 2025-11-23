import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import arrowSVG from "../../../public/images/private/arrow.svg";
import searchSVG from "../../../public/images/private/search.svg";

interface FavoriteTeamsProps {
  onBack: () => void;
}

const FavoriteTeams: React.FC<FavoriteTeamsProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Временные данные для демонстрации
  const favoriteTeams = [
    { id: 1, name: "Реал Мадрид", sport: "Футбол", logo: "https://via.placeholder.com/50" },
    { id: 2, name: "Лейкерс", sport: "Баскетбол", logo: "https://via.placeholder.com/50" },
    { id: 3, name: "Нью-Йорк Янкиз", sport: "Бейсбол", logo: "https://via.placeholder.com/50" },
  ];

  const favoriteAthletes = [
    { id: 1, name: "Криштиану Роналду", sport: "Футбол", photo: "https://via.placeholder.com/50" },
    { id: 2, name: "Леброн Джеймс", sport: "Баскетбол", photo: "https://via.placeholder.com/50" },
    { id: 3, name: "Роджер Федерер", sport: "Теннис", photo: "https://via.placeholder.com/50" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <AppButton
          onClick={onBack}
          variant="profile"
          size="sm"
          icon={<img src={arrowSVG} alt="Back" className="w-8 h-8 rotate-180" />}
        >
          {t("common.back")}
        </AppButton>
        <h1 className="text-3xl font-bold ml-4 text-black">
          {t("profile.favorite_teams.title")}
        </h1>
      </div>

      {/* Поиск */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder={t("profile.favorite_teams.search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <img
          src={searchSVG}
          alt="Search"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
        />
      </div>

      {/* Любимые команды */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-black">
          {t("profile.favorite_teams.teams_section")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteTeams.map((team) => (
            <div
              key={team.id}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <img
                src={team.logo}
                alt={team.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium text-black">{team.name}</h3>
                <p className="text-sm text-gray-600">{team.sport}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Любимые спортсмены */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6 text-black">
          {t("profile.favorite_teams.athletes_section")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteAthletes.map((athlete) => (
            <div
              key={athlete.id}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <img
                src={athlete.photo}
                alt={athlete.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium text-black">{athlete.name}</h3>
                <p className="text-sm text-gray-600">{athlete.sport}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoriteTeams; 