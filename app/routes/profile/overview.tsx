import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import arrowSVG from "../../../public/images/private/arrow.svg";
import { VerificationDialog } from "~/components/Dialogs/VerificationDialog";
import { EditPersonalInfoDialog } from "~/components/Dialogs/EditPersonalInfoDialog";
import { EditContactInfoDialog } from "~/components/Dialogs/EditContactInfoDialog";
import { EditPaymentMethodDialog } from "~/components/Dialogs/EditPaymentMethodDialog";
import { AddressDialog } from "~/components/Dialogs/AddressDialog";
import { useAuth } from "~/queries/auth";
import { useUserLikes, useUserAddresses, useAddAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from "~/queries/user";
import { useNavigate } from "react-router";
import ProductCard from "~/shared/carousel/ProductCard";
import { formatExpDate, formatPan } from "~/utils/formatCard";
import type { UserAddress } from "~/types/user";
import checkboxUnchecked from "~/assets/images/private/checkbox-unchecked.svg";
import checkboxChecked from "~/assets/images/private/checkbox-checked.svg";
import configureAddress from "~/assets/images/private/configure-address.svg";
import trash from "~/assets/images/private/trash.svg";

const ProfileOverview: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    user: currentUser,
    updatePersonalInfo,
    changePassword,
  } = useAuth();
  const { data: userLikes } = useUserLikes("item");
  const { data: addressesData } = useUserAddresses();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();
  
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showEditPersonalInfoDialog, setShowEditPersonalInfoDialog] =
    useState(false);
  const [showEditContactInfoDialog, setShowEditContactInfoDialog] =
    useState(false);
  const [showEditPaymentMethodDialog, setShowEditPaymentMethodDialog] =
    useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>();

  const addresses = addressesData?.addresses || [];

  // Локальное состояние для отслеживания прогресса верификации
  const [localVerificationState, setLocalVerificationState] = useState({
    step1Completed: currentUser?.verification?.step1Completed || false,
    step2Completed: currentUser?.verification?.step2Completed || false,
    step3Completed: currentUser?.verification?.step3Completed || false,
    step4Completed: currentUser?.verification?.step4Completed || false,
  });

  // Синхронизируем локальное состояние с данными пользователя при их изменении
  useEffect(() => {
    setLocalVerificationState({
      step1Completed: currentUser?.verification?.step1Completed || false,
      step2Completed: currentUser?.verification?.step2Completed || false,
      step3Completed: currentUser?.verification?.step3Completed || false,
      step4Completed: currentUser?.verification?.step4Completed || false,
    });
  }, [currentUser?.verification]);

  // Определяем статус каждого шага верификации
  const getStepStatus = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return localVerificationState.step1Completed;
      case 2:
        return localVerificationState.step2Completed;
      case 3:
        return localVerificationState.step3Completed;
      case 4:
        return localVerificationState.step4Completed;
      default:
        return false;
    }
  };

  // Определяем текущий активный шаг
  const getCurrentStep = () => {
    if (!getStepStatus(1)) return 1;
    if (!getStepStatus(2)) return 2;
    if (!getStepStatus(3)) return 3;
    if (!getStepStatus(4)) return 4;
    return 5; // Все шаги завершены
  };

  // Получаем соответствующий текст для текущего шага
  const getCurrentStepText = () => {
    const currentStep = getCurrentStep();
    switch (currentStep) {
      case 1:
        return {
          title: t("profile.verification.confirm_email"),
          description: t("profile.verification.email_verification_description"),
        };
      case 2:
        return {
          title: t("profile.verification.confirm_phone"),
          description: t("profile.verification.max_bet_description"),
        };
      case 3:
        return {
          title: t("profile.verification.step3_title"),
          description: t("profile.verification.step3_description"),
        };
      case 4:
        return {
          title: t("profile.verification.step4_title"),
          description: t("profile.verification.step4_description"),
        };
      default:
        return {
          title: t("profile.verification.completed"),
          description: t("profile.verification.completed_description"),
        };
    }
  };

  const handleEditPersonalInfo = () => {
    setShowEditPersonalInfoDialog(true);
  };

  const handleCloseEditPersonalInfoDialog = () => {
    setShowEditPersonalInfoDialog(false);
  };

  const handleSavePersonalInfo = (data: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    dateOfBirth?: string;
    gender?: "male" | "female";
  }) => {
    const apiData: {
      firstName?: string;
      lastName?: string;
      middleName?: string;
      dateOfBirth?: string;
      gender?: "male" | "female";
    } = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
    };

    updatePersonalInfo.mutate(apiData, {
      onSuccess: () => {
        setShowEditPersonalInfoDialog(false);
      },
    });
  };

  const handleEditContactInfo = () => {
    setShowEditContactInfoDialog(true);
  };

  const handleCloseEditContactInfoDialog = () => {
    setShowEditContactInfoDialog(false);
  };

  const handleSaveContactInfo = (data: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }) => {
    if (data.oldPassword && data.newPassword && data.confirmPassword) {
      changePassword.mutate(
        {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        {
          onSuccess: () => {
            setShowEditContactInfoDialog(false);
          },
        }
      );
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setShowAddressDialog(true);
  };

  const handleCloseAddressDialog = () => {
    setShowAddressDialog(false);
    setEditingAddress(undefined);
  };

  const handleSaveAddress = (addressData: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
    isDefault?: boolean;
  }) => {
    if (editingAddress && editingAddress._id) {
      // Редактирование существующего адреса
      updateAddressMutation.mutate(
        { addressId: editingAddress._id, addressData },
        {
          onSuccess: () => {
            handleCloseAddressDialog();
          },
        }
      );
    } else {
      // Добавление нового адреса
      addAddressMutation.mutate(addressData, {
        onSuccess: () => {
          handleCloseAddressDialog();
        },
      });
    }
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddressMutation.mutate(addressId);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm(t("profile.addresses.confirm_delete"))) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  return (
    <>
      {/* <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-3 sm:p-6 text-center">
          <div className="text-4xl font-bold text-black">0</div>
          <div className="text-black text-xs sm:text-lg mt-2">{t("profile.stats.won_items")}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-6 text-center">
          <div className="text-4xl font-bold text-black">0</div>
          <div className="text-black text-xs sm:text-lg mt-2">
            {t("profile.stats.auction_items")}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-6 text-center">
          <div className="text-4xl font-bold text-black">0</div>
          <div className="text-black text-xs sm:text-lg mt-2">{t("profile.stats.placed_bets")}</div>
        </div>
      </div> */}

      {/* Секция верификации */}
      {getCurrentStep() !== 5 && (
        <div className="bg-white rounded-lg shadow p-6 px-6 sm:px-[50px] mb-4 sm:mb-8">
          <div className="inline-flex items-center justify-left mb-4 space-x-4 relative ml-5">
            <div
              className="absolute top-6 h-px"
              style={{
                backgroundColor: "#DCDCDC",
                zIndex: 0,
                left: "-20px",
                width: "calc(100% + 40px)",
              }}
            />
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-12 h-12 flex items-center justify-center rounded-full border-2 relative z-10 ${
                  getStepStatus(step)
                    ? "bg-[#F9B234] border-[#F9B234] text-[#121212]"
                    : "bg-[#DCDCDC] border-[#DCDCDC] text-[#B8B8B8]"
                } font-bold`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="text-lg font-semibold mb-2 text-black">
            {getCurrentStepText().title}
          </div>
          <div className="text-sm sm:text-lg mb-4 text-gray-800">
            {getCurrentStepText().description}
          </div>
          <AppButton
            onClick={() => setShowVerificationDialog(true)}
            variant="profile"
            size="sm"
            icon={<img src={arrowSVG} alt="Arrow" className="w-8 h-8" />}
            className="text-sm sm:text-base"
          >
            {t("profile.verification.continue_verification")}
          </AppButton>
        </div>
      )}

      {/* Блоки пользовательской информации */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-0 sm:mb-8">
        {/* Блок 1: Детали */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h3 className="text-xl font-semibold text-black mb-2 sm:mb-4">
            {t("profile.details.title")}
          </h3>
          <div className="space-y-1 sm:space-y-3 mb-6 flex-grow">
            <div>
              <label className="text-sm text-gray-600">
                {t("profile.details.name")}
              </label>
              <p className="text-black font-medium">
                {currentUser?.firstName && currentUser?.lastName
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : currentUser?.firstName ||
                    currentUser?.lastName ||
                    t("profile.details.not_specified")}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">
                {t("profile.details.date_of_birth")}
              </label>
              <p className="text-black font-medium">
                {currentUser?.dateOfBirth
                  ? new Date(currentUser.dateOfBirth).toLocaleDateString(
                      "ru-RU"
                    )
                  : t("profile.details.not_specified")}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">
                {t("profile.details.gender")}
              </label>
              <p className="text-black font-medium">
                {currentUser?.gender
                  ? t(`profile.genders.${currentUser.gender}`)
                  : t("profile.details.not_specified")}
              </p>
            </div>
          </div>
          <div className="mt-auto">
            <AppButton
              onClick={handleEditPersonalInfo}
              variant="profile"
              size="sm"
              icon={<img src={arrowSVG} alt="Arrow" className="w-8 h-8" />}
              disabled={updatePersonalInfo.isPending}
            >
              {updatePersonalInfo.isPending
                ? t("profile.edit_personal_info.saving")
                : t("profile.details.edit")}
            </AppButton>
          </div>
        </div>

        {/* Блок 2: Контактная информация */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h3 className="text-xl font-semibold text-black mb-2 sm:mb-4">
            {t("profile.contact_info.title")}
          </h3>
          <div className="space-y-1 sm:space-y-3 mb-6 flex-grow">
            <div>
              <label className="text-sm text-gray-600">
                {t("profile.details.email")}
              </label>
              <p className="text-black font-medium">
                {currentUser?.email || t("profile.details.not_specified")}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">
                {t("profile.contact_info.phone")}
              </label>
              <p className="text-black font-medium">
                {currentUser?.phone || t("profile.details.not_specified")}
              </p>
            </div>
          </div>
          <div className="mt-auto">
            <AppButton
              onClick={handleEditContactInfo}
              variant="profile"
              size="sm"
              icon={<img src={arrowSVG} alt="Arrow" className="w-8 h-8" />}
            >
              {t("profile.contact_info.edit")}
            </AppButton>
          </div>
        </div>

        {/* Блок 3: Адрес доставки */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h3 className="text-xl font-semibold text-black mb-2 sm:mb-4">
            {t("profile.address.title")}
          </h3>
          <div className="space-y-3 mb-6 flex-grow">
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <div
                  key={address._id}
                  className="border border-gray-200 rounded-lg p-3 flex justify-between items-start gap-4"
                >
                  <div className="flex-1">
                    {address.isDefault && (
                      <span className="inline-block mb-2 px-2 py-1 text-xs font-medium text-[#121212] bg-yellow-400 rounded-full">
                        {t("profile.addresses.default")}
                      </span>
                    )}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-black">{address.name}</h4>
                      <p className="text-sm text-gray-700">
                        {address.street}
                        <br />
                        {address.city}, {address.postalCode}
                        <br />
                        {address.country}
                      </p>
                    </div>
                  </div>
                  
                  {/* Кнопки действий */}
                  <div className="flex items-center space-x-2">
                    {/* Кнопка "Установить как основной" */}
                    {!address.isDefault ? (
                      <button
                        onClick={() => handleSetDefault(address._id!)}
                        disabled={setDefaultAddressMutation.isPending}
                        className="flex items-center justify-center cursor-pointer"
                        title={t("profile.addresses.set_default")}
                      >
                        <img
                          src={checkboxUnchecked}
                          alt="checkbox-unchecked"
                          className="w-6 h-6"
                        />
                      </button>
                    ) : (
                      <img src={checkboxChecked} alt="checkbox-checked" className="w-6 h-6" />
                    )}

                    {/* Кнопка редактирования */}
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="cursor-pointer"
                      title={t("profile.addresses.edit")}
                    >
                      <img
                        src={configureAddress}
                        alt="configure-address"
                        className="w-6 h-6"
                      />
                    </button>

                    {/* Кнопка удаления */}
                    {addresses.length > 1 && (
                      <button
                        onClick={() => handleDeleteAddress(address._id!)}
                        disabled={deleteAddressMutation.isPending}
                        className="cursor-pointer"
                        title={t("profile.addresses.delete")}
                      >
                        <img
                          src={trash}
                          alt={t("profile.addresses.delete")}
                          className="w-6 h-6"
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">
                {t("profile.details.not_specified")}
              </p>
            )}
          </div>
          <div className="mt-auto">
            <AppButton
              onClick={handleAddAddress}
              variant="profile"
              size="sm"
              icon={<img src={arrowSVG} alt="Arrow" className="w-8 h-8" />}
            >
              {t("profile.address.add")}
            </AppButton>
          </div>
        </div>

        {/* Блок 4: Привязанные карты */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h3 className="text-xl font-semibold text-black mb-2 sm:mb-4">
            {t("profile.payment.title")}
          </h3>
          <div className="space-y-1 sm:space-y-3 mb-6 flex-grow">
            {currentUser?.tbankCustomer?.cards &&
            currentUser.tbankCustomer.cards.length > 0 ? (
              currentUser.tbankCustomer.cards.map((card) => (
                <div key={card.cardId} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-black font-medium">
                        {formatPan(card.pan)}
                      </p>
                      {card.cardName && (
                        <p className="text-sm text-gray-600">{card.cardName}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {card.status === "Active" ? "Активна" : card.status}
                      </p>
                    </div>
                    {card.expDate && (
                      <p className="text-sm text-gray-600">
                        {formatExpDate(card.expDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">
                {t("profile.details.not_specified")}
              </p>
            )}
          </div>
          <div className="mt-auto">
            <AppButton
              onClick={() => setShowEditPaymentMethodDialog(true)}
              variant="profile"
              size="sm"
              icon={<img src={arrowSVG} alt="Arrow" className="w-8 h-8" />}
            >
              {t("profile.payment.edit")}
            </AppButton>
          </div>
        </div>
      </div>

      {/* Список желаний */}
      {userLikes &&
        userLikes.pages.flatMap((page) => page.likes).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-semibold mb-4 text-black">
              {t("profile.wishlist.title")}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 mb-6 mt-10">
              {userLikes?.pages
                .flatMap((page) => page.likes)
                .map((item) => (
                  <div
                    key={item.id}
                    className="w-full flex flex-col items-center"
                  >
                    <ProductCard
                      product={
                        {
                          _id: item.sourceId,
                          title: item.name,
                          slug: item.slug,
                          images: item.image ? [item.image] : [],
                          price: 0, // UserLike не содержит цену, будет загружена из API
                          endDate: new Date(), // Аналогично для даты окончания
                          labels: [], // И для меток
                          isLiked: true, // В вишлисте все товары по определению понравились
                        } as any
                      }
                      loadFullData={true} // Загружаем полные данные для вишлиста
                      isFullWidth={true}
                      showLabels={false}
                    />
                  </div>
                ))}
            </div>
            <AppButton
              variant="profile"
              size="sm"
              icon={<img src={arrowSVG} alt="Arrow" className="w-8 h-8" />}
              onClick={() => navigate("/profile/my-wishlist")}
            >
              {t("profile.wishlist.view_all")}
            </AppButton>
          </div>
        )}

      {/* Диалоги */}
      {currentUser && (
        <>
          <VerificationDialog
            isOpen={showVerificationDialog}
            user={currentUser}
            onClose={() => setShowVerificationDialog(false)}
            onStepCompleted={(stepNumber) => {
              setLocalVerificationState((prev) => ({
                ...prev,
                [`step${stepNumber}Completed`]: true,
              }));
            }}
          />

          <EditPersonalInfoDialog
            isOpen={showEditPersonalInfoDialog}
            user={currentUser}
            onClose={handleCloseEditPersonalInfoDialog}
            onSave={handleSavePersonalInfo}
            isLoading={updatePersonalInfo.isPending}
          />
        </>
      )}

      <EditContactInfoDialog
        isOpen={showEditContactInfoDialog}
        onClose={handleCloseEditContactInfoDialog}
        onSave={handleSaveContactInfo}
        isLoading={changePassword.isPending}
      />

      <EditPaymentMethodDialog
        isOpen={showEditPaymentMethodDialog}
        onClose={() => setShowEditPaymentMethodDialog(false)}
      />

      <AddressDialog
        isOpen={showAddressDialog}
        onClose={handleCloseAddressDialog}
        onSave={handleSaveAddress}
        address={editingAddress}
        isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
      />
    </>
  );
};

export default ProfileOverview;
