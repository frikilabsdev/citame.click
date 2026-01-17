import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Clock, DollarSign, Image as ImageIcon } from "lucide-react";
import type { Service, ServiceImage } from "@/shared/types";

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onSelectService: (service: Service) => void;
  customColors?: {
    card_background_color?: string;
    card_border_color?: string;
    service_title_color?: string;
    text_color?: string;
    time_text_color?: string;
    price_color?: string;
  };
}

export default function ServiceDetailModal({
  isOpen,
  onClose,
  service,
  onSelectService,
  customColors,
}: ServiceDetailModalProps) {
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    if (service && isOpen) {
      fetchImages();
    } else {
      setImages([]);
      setCurrentImageIndex(0);
    }
  }, [service, isOpen]);

  const fetchImages = async () => {
    if (!service?.id) return;

    setIsLoadingImages(true);
    try {
      const response = await fetch(`/api/public/services/${service.id}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data || []);
        setCurrentImageIndex(0);
      }
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const allImages = service?.main_image_url
    ? [
        { image_url: service.main_image_url, id: -1 } as ServiceImage,
        ...images,
      ]
    : images;

  const currentImage = allImages[currentImageIndex];

  const nextImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  if (!isOpen || !service) return null;

  const getFullDescription = (description: string | null): string => {
    if (!description) return "No hay descripción disponible para este servicio.";
    return description;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: customColors?.card_background_color || "#ffffff",
          borderColor: customColors?.card_border_color || "#e5e7eb",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Gallery */}
        {(service?.main_image_url || images.length > 0 || isLoadingImages) && (
          <div className="relative w-full h-64 sm:h-80 bg-slate-100 rounded-t-2xl overflow-hidden">
            {isLoadingImages ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : currentImage ? (
              <img
                src={currentImage.image_url}
                alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon className="w-16 h-16" />
              </div>
            )}

            {/* Navigation arrows - Show if there's more than 1 image */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image indicators - Show if there's more than 1 image */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Service Title */}
          <div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: customColors?.service_title_color || "#111827" }}
            >
              {service.title}
            </h2>
            <div className="flex items-center space-x-6 text-sm mt-4">
              {service.duration_minutes && (
                <div
                  className="flex items-center space-x-2"
                  style={{ color: customColors?.time_text_color || "#6b7280" }}
                >
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} minutos</span>
                </div>
              )}
              {service.price && (
                <div
                  className="flex items-center space-x-2 font-semibold text-lg"
                  style={{ color: customColors?.price_color || "#059669" }}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>${service.price.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Full Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors?.service_title_color || "#111827" }}>
              Descripción
            </h3>
            <p
              className="text-base leading-relaxed whitespace-pre-wrap"
              style={{ color: customColors?.text_color || "#374151" }}
            >
              {getFullDescription(service.description)}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t" style={{ borderColor: customColors?.card_border_color || "#e5e7eb" }}>
            <button
              onClick={() => {
                onSelectService(service);
                onClose();
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
            >
              Seleccionar este Servicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
