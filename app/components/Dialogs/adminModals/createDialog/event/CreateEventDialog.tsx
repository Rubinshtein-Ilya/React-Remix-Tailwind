import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "~/shared/inputs/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/shared/ui/Select";
import { AppButton } from "~/shared/buttons/AppButton";
import { DialogBase } from "../../DialogBase";
import { Stepper } from "~/shared/ui/Stepper";
import { useSports } from "~/queries/public";
import { useCreateEvent } from "~/queries/admin";

const createEventSchema = z.object({
  sportId: z.string().min(1, "admin.events.create_dialog.errors.sport_id_required"),
  name: z.string().min(1, "admin.events.create_dialog.errors.name_required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "admin.events.create_dialog.errors.start_date_required"),
  endDate: z.string().min(1, "admin.events.create_dialog.errors.end_date_required"),
  isPartner: z.boolean(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Простой компонент для загрузки изображений
const SimpleImageUpload: React.FC<{
  selectedImages: File[];
  setSelectedImages: React.Dispatch<React.SetStateAction<File[]>>;
}> = ({ selectedImages, setSelectedImages }) => {
  const { t } = useTranslation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("admin.events.create_dialog.fields.images")}
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {selectedImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {t("admin.events.create_dialog.selected_images")}: {selectedImages.length}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Простой компонент для отображения результата
const SimpleResultDisplay: React.FC<{
  createdEvent: any;
}> = ({ createdEvent }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">
        {t("admin.events.create_dialog.created_event")}
      </h3>
      <p className="text-sm text-gray-600">
        {t("admin.events.create_dialog.event_created_success")}
      </p>
      {createdEvent && (
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <pre className="text-sm text-gray-700 overflow-auto">
            {JSON.stringify(createdEvent, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [createdEvent, setCreatedEvent] = useState<any>(null);

  const sportsQuery = useSports();
  const createEventMutation = useCreateEvent();

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      sportId: "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      isPartner: false,
    },
  });

  const handleClose = () => {
    setStep(0);
    setSelectedImages([]);
    setCreatedEvent(null);
    form.reset();
    onClose();
  };

  const handleNext = () => {
    if (step === 0) {
      form.trigger().then((isValid) => {
        if (isValid) {
          setStep(1);
        }
      });
    } else if (step === 1) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const formData = form.getValues();
    
    const eventData = {
      sportId: formData.sportId,
      name: formData.name,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      isPartner: formData.isPartner || false,
      // Добавляем пустые обязательные поля для сервера
      country: "",
      city: "",
      stadium: "",
      participants: [],
    };

    createEventMutation.mutate(
      {
        fields: eventData,
        images: selectedImages,
      },
      {
        onSuccess: (data) => {
          setCreatedEvent(data);
          setStep(2);
        },
      }
    );
  };

  const steps = [
    t("admin.events.create_dialog.data_step_label"),
    t("admin.events.create_dialog.photo_step_label"),
    t("admin.events.create_dialog.done_step_label"),
  ];

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="space-y-6">
        <div className="pb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("admin.events.create_dialog.title")}
          </h2>
          <Stepper
            steps={steps}
            activeStep={step}
          />
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.events.create_dialog.fields.sport_id")}
              </label>
              <Select
                value={form.watch("sportId")}
                onValueChange={(value: string) => form.setValue("sportId", value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {form.watch("sportId") ? 
                      sportsQuery.data?.find(s => s._id === form.watch("sportId"))?.name || 
                      t("admin.events.create_dialog.fields.sport_id_placeholder") :
                      t("admin.events.create_dialog.fields.sport_id_placeholder")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sportsQuery.data?.map((sport) => (
                    <SelectItem key={sport._id} value={sport._id}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.sportId && (
                <p className="text-red-500 text-sm mt-1">
                  {t(form.formState.errors.sportId.message || "")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.events.create_dialog.fields.name")}
              </label>
              <Input
                {...form.register("name")}
                placeholder={t("admin.events.create_dialog.fields.name_placeholder")}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {t(form.formState.errors.name.message || "")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.events.create_dialog.fields.description")}
              </label>
              <textarea
                {...form.register("description")}
                placeholder={t("admin.events.create_dialog.fields.description_placeholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.events.create_dialog.fields.start_date")}
                </label>
                <Input
                  {...form.register("startDate")}
                  type="datetime-local"
                />
                {form.formState.errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {t(form.formState.errors.startDate.message || "")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.events.create_dialog.fields.end_date")}
                </label>
                <Input
                  {...form.register("endDate")}
                  type="datetime-local"
                />
                {form.formState.errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {t(form.formState.errors.endDate.message || "")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register("isPartner")}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t("admin.events.create_dialog.fields.is_partner")}
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <SimpleImageUpload
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />
        )}

        {step === 2 && (
          <SimpleResultDisplay createdEvent={createdEvent} />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <AppButton variant="secondary" onClick={handleClose}>
            {t("common.cancel")}
          </AppButton>
          {step < 2 && (
            <>
              {step > 0 && (
                <AppButton variant="ghost" onClick={() => setStep(step - 1)}>
                  {t("common.back")}
                </AppButton>
              )}
              <AppButton
                variant="primary"
                onClick={handleNext}
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending
                  ? t("common.creating")
                  : step === 1
                  ? t("common.create")
                  : t("common.next")}
              </AppButton>
            </>
          )}
        </div>
      </div>
    </DialogBase>
  );
}; 
