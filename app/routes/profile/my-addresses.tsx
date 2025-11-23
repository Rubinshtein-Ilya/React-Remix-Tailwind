import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { AddressDialog } from "~/components/Dialogs/AddressDialog";
import {
  useUserAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "~/queries/user";
import type { UserAddress } from "~/types/user";
import checkboxUnchecked from "~/assets/images/private/checkbox-unchecked.svg";
import checkboxChecked from "~/assets/images/private/checkbox-checked.svg";
import configureAddress from "~/assets/images/private/configure-address.svg";
import trash from "~/assets/images/private/trash.svg";

const MyAddresses: React.FC = () => {
  const { t } = useTranslation();
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>();

  // Хуки для работы с адресами
  const { data: addressesData, isLoading } = useUserAddresses();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();

  const addresses = addressesData?.addresses || [];

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setShowAddressDialog(true);
  };

  const handleCloseDialog = () => {
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
            handleCloseDialog();
          },
        }
      );
    } else {
      // Добавление нового адреса
      addAddressMutation.mutate(addressData, {
        onSuccess: () => {
          handleCloseDialog();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow px-4  sm:px-[50px] py-4 sm:py-[36px]">
      {/* Заголовок и кнопка добавления */}
      <div className="flex flex-col gap-y-2 sm:gap-y-0 sm:flex-row justify-between items-center mb-6">
        <AppButton variant="secondary" size="sm" fullWidth={false} onClick={handleAddAddress}>
          {t("profile.addresses.add_new")}
        </AppButton>
      </div>

      {/* Список адресов */}
      {addresses.length > 0 ? (
        <div className="space-y-4 mb-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start gap-y-4"
            >
              <div className="flex-1">
                {address.isDefault && (
                  <span className="inline-block mb-2 px-2 py-1 text-xs font-medium text-[#121212] bg-yellow-400 rounded-full">
                    {t("profile.addresses.default")}
                  </span>
                )}

                <div className="space-y-2">
                  <h3 className="text-[20px] font-medium text-[#121212]">{address.name}</h3>
                  <p className="text-[#121212] font-[17px]">
                    {address.street}
                    <br />
                    {address.city}, {address.postalCode}
                    <br />
                    {address.country}
                  </p>
                </div>
              </div>

              {/* Кнопки действий справа */}
              <div className="flex  items-center space-x-2 sm:ml-4">
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
                      className="w-[34px] h-[34px]"
                    />
                  </button>
                ) : (
                  <img src={checkboxChecked} alt="checkbox-checked" className="w-[34px] h-[34px]" />
                )}

                {/* Кнопка редактирования */}
                <button
                  onClick={() => handleEditAddress(address)}
                  className=" cursor-pointer"
                  title={t("profile.addresses.edit")}
                >
                  <img
                    src={configureAddress}
                    alt="configure-address"
                    className="w-[34px] h-[34px]"
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
                      className="w-[34px] h-[34px]"
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Пустое состояние */
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("profile.addresses.no_addresses")}
          </h3>
          <p className="text-sm text-gray-500 mb-4">{t("profile.addresses.no_addresses_desc")}</p>
        </div>
      )}

      {/* Диалог добавления/редактирования адреса */}
      <AddressDialog
        isOpen={showAddressDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveAddress}
        address={editingAddress}
        isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
      />
    </div>
  );
};

export default MyAddresses;
