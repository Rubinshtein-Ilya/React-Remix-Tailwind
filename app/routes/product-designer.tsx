import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Application, type ICanvas } from "pixi.js";
import productDesigner from "../productDesigner/ProductDesigner";

import { useDesignerStore } from "~/stores/useDesignerStore";
import { 
  setTShirtSide,
  setFrameMaterialId,
  setSleevePlacement,
  ESleevePlacement,
  setFrameColorId,
  setInfoSignId,
  setInfoSignColorId,
  setInfoSignText,
  setPhotoType,
  EPhotoType,
  setGlassId,
  setDoubleFrameColorId
} from "~/stores/designerStore";
import { ETShirtSide } from "~/stores/designerStore";

import tShirtExampleFront from "../assets/designer/tShirtExampleFront.png";
import tShirtExampleBack from "../assets/designer/tShirtExampleBack.png";

import sleevesExample1 from "../assets/designer/sleevesExample1.png";
import sleevesExample2 from "../assets/designer/sleevesExample2.png";

import frameExPlastic from "../assets/designer/frameExPlastic.png";
import frameExWood1 from "../assets/designer/frameExWood1.png";
import frameExWood2 from "../assets/designer/frameExWood2.png";

import frameColor1 from "../assets/designer/frameColor1.png";
import frameColor2 from "../assets/designer/frameColor2.png";
import frameColor3 from "../assets/designer/frameColor3.png";
import frameColor4 from "../assets/designer/frameColor4.png";
import frameColor5 from "../assets/designer/frameColor5.png";
import frameColor6 from "../assets/designer/frameColor6.png";
import frameColor7 from "../assets/designer/frameColor7.png";
import frameColor8 from "../assets/designer/frameColor8.png";

// import 

import noneSVG from "../assets/designer/none.svg";
import sign1 from "../assets/designer/sign1.png";
import sign2 from "../assets/designer/sign2.png";
import signSilver from "../assets/designer/sign_silver.png";

import photo1 from "../assets/designer/photo1.png";
import photo2 from "../assets/designer/photo2.png";

import glass1 from "../assets/designer/glass1.png";
import glass2 from "../assets/designer/glass2.jpg";

export const frameColorsShop = [
  {
    id: "1",
    name: "Кремовый",
    image: frameColor1,
    textureName: "frameColor1",
    conturColor: "0x999b9d"
  },
  {
    id: "2",
    name: "Темный",
    image: frameColor2,
    textureName: "frameColor2",
    conturColor: "0x2e2f31"
  },
  {
    id: "3",
    name: "Лавандовый",
    image: frameColor3,
    textureName: "frameColor3",
    conturColor: "0x999b9d"
  },
  {
    id: "4",
    name: "Синий",
    image: frameColor4,
    textureName: "frameColor4",
    conturColor: "0x406ec3"
  },
  {
    id: "5",
    name: "Красный",
    image: frameColor5,
    textureName: "frameColor5",
    conturColor: "0xcf2726"
  },
  {
    id: "6",
    name: "Зеленый",
    image: frameColor6,
    textureName: "frameColor6",
    conturColor: "0x4b5c2f"
  },
  {
    id: "7",
    name: "Желтый",
    image: frameColor7,
    textureName: "frameColor7",
    conturColor: "0xd9b23d"
  },
  {
    id: "8",
    name: "Черный",
    image: frameColor8,
    textureName: "frameColor8",
    conturColor: "0x191816"
  }  
];


const Painter: React.FC = () => {
  const { 
    tShirtSide, 
    frameMaterialId,
    sleevePlacement, 
    frameColorId, 
    infoSignId, 
    infoSignColorId,
    infoSignText,
    photoType,
    glassId,
    doubleFrameColorId
   } = useDesignerStore();
  const painerContainer = useRef<HTMLCanvasElement>(null);
  const isPainterInit = useRef(false);

  useEffect(() => {
    if (!painerContainer.current) return;
    if (isPainterInit.current) return;

    isPainterInit.current = true;

    const newApp = new Application();
    newApp.init({
      backgroundAlpha: 0,
      antialias: true,
      canvas: painerContainer.current as ICanvas,
    })
      .then(() => {
        newApp.stage.hitArea = newApp.screen;
        productDesigner.initialization(newApp).then(() => {
          isPainterInit.current = true;
        });
      });
  }, []);

  const handleTShirtSide = useCallback((tShirtSide: ETShirtSide) => {
    setTShirtSide(tShirtSide);
  }, []);

  const handleFrameMaterialId = useCallback((frameMaterialId: string) => {
    // setFrameMaterialId(frameMaterialId);
  }, []);

  const handleSleevePlacement = useCallback((sleevePlacement: ESleevePlacement) => {
    setSleevePlacement(sleevePlacement);
  }, []);

  const handleFrameColorId = useCallback((frameColorId: string) => {
    setFrameColorId(frameColorId);
  }, []);

  const handleDoubleFrameColorId = useCallback((doubleFrameColorId: string) => {
    setDoubleFrameColorId(doubleFrameColorId);
  }, []);

  const handleInfoSignId = useCallback((infoSignId: string) => {
    setInfoSignId(infoSignId);
  }, []);

  const handleInfoSignColorId = useCallback((infoSignColorId: string) => {
    setInfoSignColorId(infoSignColorId);
  }, []);

  const handleInfoSignText = useCallback((infoSignText: string) => {
    setInfoSignText(infoSignText);
  }, []);

  const handlePhotoType = useCallback((photoType: EPhotoType) => {
    setPhotoType(photoType);
  }, []);

  const handleGlassId = useCallback((glassId: string) => {
    setGlassId(glassId);
  }, []);

  const handlePhotoUpload = useCallback((photoId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        productDesigner.setUploadedPhotoBase64(photoId, base64);
        console.log(base64);
      }

      reader.readAsDataURL(file);
    }

    input.click();
  }, []);

  return (
    <div id="dfdf" className="min-h-screen bg-gray-50 mt-30 px-4 py-16 bg-[#FFF]">
      <div className="max-w-7xl mx-auto mb-10">
        <canvas id="painter-canvas" ref={painerContainer} className="w-full h-200 " />
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <svg width="24" height="24" fill="white"><circle cx="12" cy="12" r="10" /></svg>
          </span>
          <h1 className="text-2xl font-bold">НАЗВАНИЕ ТОВАРА</h1>
        </div>

        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="font-bold text-base">РАСПОЛОЖЕНИЕ ФУТБОЛКИ</div>
              <div className="text-xs text-gray-600">Оформление в Багетной мастерской</div>
            </div>
            <div className="text-xs text-gray-500">Включено в стоимость</div>
          </div>
          <div className="flex gap-4 mt-4" >
            <div onClick={() => handleTShirtSide(ETShirtSide.FRONT)} className={`w-32 h-40 border-2 rounded flex items-center justify-center bg-white ${tShirtSide === ETShirtSide.FRONT ? "border-black" : "border-gray-200"}`}>
              <img src={tShirtExampleFront} alt="" className="object-contain h-60" />
            </div>
            <div onClick={() => handleTShirtSide(ETShirtSide.BACK)} className={`w-32 h-40 border-2 rounded flex items-center justify-center bg-white ${tShirtSide === ETShirtSide.BACK ? "border-black" : "border-gray-200"}`}>
              <img src={tShirtExampleBack} alt="" className="object-contain h-60" />
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-base">РАСПОЛОЖЕНИЕ РУКАВОВ</div>
            <div className="text-xs text-gray-500">Включено в стоимость</div>
          </div>
          <div className="text-xs text-gray-600 mb-2">Сложенные рукава</div>
          <div className="flex gap-4 mt-2">
            <div
              onClick={() => handleSleevePlacement(ESleevePlacement.FOLDED)}
              className={`w-32 h-32 border-2 ${sleevePlacement === ESleevePlacement.FOLDED ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
            >
              <img src={sleevesExample1} alt="" className="object-contain h-60" />
            </div>
            <div
              onClick={() => handleSleevePlacement(ESleevePlacement.UNFOLDED)}
              className={`w-32 h-32 border-2 ${sleevePlacement === ESleevePlacement.UNFOLDED ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
            >
              <img src={sleevesExample2} alt="" className="object-contain h-60" />
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-base">МАТЕРИАЛ РАМКИ</div>
            <div className="text-base text-black font-medium">+ 2 000 Р</div>
          </div>
          <div className="text-xs text-gray-600 mb-2">Пластик</div>
          <div className="flex gap-4 mt-2">
            <div
              onClick={() => handleFrameMaterialId("1")}
              className={`w-32 h-40 border-2 ${frameMaterialId === "1" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
            >
              <img src={frameExPlastic} alt="" className="object-contain h-60" />
            </div>
            <div
              onClick={() => handleFrameMaterialId("2")}
              className={`w-32 h-40 border-2 ${frameMaterialId === "2" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
            >
              <img src={frameExWood1} alt="" className="object-contain h-60" />
            </div>
            <div onClick={() => handleFrameMaterialId("3")} className={`w-32 h-40 border-2  ${frameMaterialId === "3" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}>
              <img src={frameExWood2} alt="" className="object-contain h-60" />
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-base">ЦВЕТ РАМКИ</div>
            <div className="text-base text-black font-medium">+ 2 000 Р</div>
          </div>
          <div className="text-xs text-gray-600 mb-2">{frameColorsShop.find(color => color.id === frameColorId)?.name}</div>
          <div className="flex gap-4 mt-2">
            {frameColorsShop.map((color) => (
              <div
                key={color.id}
                onClick={() => handleFrameColorId(String(color.id))}
                className={`w-32 h-40 border-2 ${frameColorId === String(color.id) ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white cursor-pointer`}
                title={color.name}
              >
                <img src={color.image} alt={color.name} className="h-20" />
              </div>
            ))}
          </div>
        </div>        
        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-base">ДВОЙНАЯ РАМКА С ЦВЕТОМ</div>
            <div className="text-base text-black font-medium">+ 2 000 Р</div>
          </div>
          <div className="text-xs text-gray-600 mb-2">{frameColorsShop.find(color => color.id === doubleFrameColorId)?.name}</div>
          <div className="flex gap-4 mt-2">
            {frameColorsShop.map((color) => (
              <div
                key={color.id}
                onClick={() => handleDoubleFrameColorId(String(color.id))}
                className={`w-32 h-40 border-2 ${doubleFrameColorId === String(color.id) ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white cursor-pointer`}
                title={color.name}
              >
                <img src={color.image} alt={color.name} className="h-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-base">ТАБЛИЧКА</div>
            <div className="text-base text-black font-medium">+ 2 000 Р</div>
          </div>
          <div className="text-xs text-gray-600 mb-2">1 шт</div>
        </div>
        <div className="flex gap-4 mt-2">
          <div 
            onClick={() => handleInfoSignId("1")} 
            className={`w-32 h-40 border-2 ${infoSignId === "1" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={sign1} alt="" className="object-contain h-60" />
          </div>
          <div 
            onClick={() => handleInfoSignId("2")} 
            className={`w-32 h-40 border-2 ${infoSignId === "2" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={sign2} alt="" className="object-contain h-60" />
          </div>
          <div 
            onClick={() => handleInfoSignId("3")} 
            className={`w-32 h-40 border-2 ${infoSignId === "3" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={noneSVG} alt="" className="object-contain h-30" />
          </div>
        </div>

        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-base">ЦВЕТ ТАБЛИЧКИ</div>
            <div className="text-base text-black font-medium">+ 2 000 Р</div>
          </div>
          <div className="text-xs text-gray-600 mb-2">Золотой</div>
        </div>
        <div className="flex gap-4 mt-2">
          <div 
            onClick={() => handleInfoSignColorId("1")} 
            className={`w-32 h-40 border-2 ${infoSignColorId === "1" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={sign1} alt="" className="object-contain h-60" />
          </div>
          <div 
            onClick={() => handleInfoSignColorId("2")} 
            className={`w-32 h-40 border-2 ${infoSignColorId === "2" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={signSilver} alt="" className="object-contain h-60" />
          </div>
        </div> 
        
        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="font-bold text-base">ТЕКСТ ТАБЛИЧКИ</div>
              <div className="text-xs text-gray-600">Измените текст, который будет расположен на табличке или введите свой текст</div>
            </div>
            <div className="text-base text-black font-medium">+ 1 000 Р</div>
          </div>
          <div className="mt-4">
            <textarea
              value={infoSignText}
              onChange={(e) => handleInfoSignText(e.target.value)}
              placeholder="Измените текст, который будет расположен на табличке или введите свой текст"
              rows={2}
              className="w-full bg-[#F8F8F8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
            <button
              type="button"
              className="mt-4 w-[160px] bg-black text-white py-3 px-6 rounded-full hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
            >
              <span>ИЗМЕНИТЬ</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-base">ФОТО</div>
            <div className="text-base text-black font-medium">+ 2 000 Р</div>
          </div>
          <div className="text-xs text-gray-600 mb-2">1 шт</div>
        </div>
        <div className="flex gap-4 mt-2">
          <div 
            onClick={() => handlePhotoType(EPhotoType.PHOTO2)} 
            className={`w-32 h-40 border-2 ${photoType === EPhotoType.PHOTO2 ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={photo1} alt="" className="object-contain h-60" />
          </div>
          <div 
            onClick={() => handlePhotoType(EPhotoType.PHOTO3)} 
            className={`w-32 h-40 border-2 ${photoType === EPhotoType.PHOTO3 ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={photo2} alt="" className="object-contain h-60" />
          </div>
          <div 
            onClick={() => handlePhotoType(EPhotoType.NONE)} 
            className={`w-32 h-40 border-2 ${photoType === EPhotoType.NONE ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={noneSVG} alt="" className="object-contain h-30" />
          </div>
        </div>

        {photoType !== EPhotoType.NONE && (
          <>
            <div className="border-t pt-8 mb-8">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-base">ФОТО СЛЕВА</div>
                  <div className="text-xs text-gray-600">Пейзажные фотографии смотрятся лучше всего</div>
                </div>
                <div className="text-base text-black font-medium">+ 1000 Р</div>
              </div>
              <div className="mt-4" onClick={() => handlePhotoUpload("1")}>
                <div className="w-full h-48 bg-[#F8F8F8] rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 5v14m-7-7h14" />
                  </svg>
                  <div className="mt-2 text-lg font-medium text-gray-500">ЗАГРУЗИТЬ ФОТО</div>
                  <div className="text-xs text-gray-400">jpg, jpeg, png, max. 10MB</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8 mb-8">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-base">ФОТО СПРАВА</div>
                  <div className="text-xs text-gray-600">Пейзажные фотографии смотрятся лучше всего</div>
                </div>
                <div className="text-base text-black font-medium">+ 1000 Р</div>
              </div>
              <div className="mt-4" onClick={() => handlePhotoUpload("2")}>
                <div className="w-full h-48 bg-[#F8F8F8] rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 5v14m-7-7h14" />
                  </svg>
                  <div className="mt-2 text-lg font-medium text-gray-500">ЗАГРУЗИТЬ ФОТО</div>
                  <div className="text-xs text-gray-400">jpg, jpeg, png, max. 10MB</div>
                </div>
              </div>
            </div>

            {photoType === EPhotoType.PHOTO3 && (
              <div className="border-t pt-8 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-bold text-base">ФОТО ПОСЕРЕДИНЕ</div>
                    <div className="text-xs text-gray-600">Пейзажные фотографии смотрятся лучше всего</div>
                  </div>
                  <div className="text-base text-black font-medium">+ 1000 Р</div>
                </div>
                <div className="mt-4" onClick={() => handlePhotoUpload("3")}>
                  <div className="w-full h-48 bg-[#F8F8F8] rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M12 5v14m-7-7h14" />
                    </svg>
                    <div className="mt-2 text-lg font-medium text-gray-500">ЗАГРУЗИТЬ ФОТО</div>
                    <div className="text-xs text-gray-400">jpg, jpeg, png, max. 10MB</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}



        <div className="border-t pt-8 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-base">СТЕКЛО</div>
            <div className="text-base text-black font-medium">+ 2 000 Р</div>
          </div>
          <div className="text-xs text-gray-600 mb-2">Обычное</div>
        </div>
        <div className="flex gap-4 mt-2">
          <div 
            onClick={() => handleGlassId("1")} 
            className={`w-32 h-40 border-2 ${glassId === "1" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={glass1} alt="" className="object-contain h-60" />
          </div>
          <div 
            onClick={() => handleGlassId("2")} 
            className={`w-32 h-40 border-2 ${glassId === "2" ? "border-black" : "border-gray-200"} rounded flex items-center justify-center bg-white`}
          >
            <img src={glass2} alt="" className="object-contain h-60" />
          </div>
        </div>

        <div className="border-t pt-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">ИТОГО</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Расположение: лицевая сторона</span>
              <span>Бесплатно</span>
            </div>
            <div className="flex justify-between">
              <span>Расположение рукавов: сложены</span>
              <span>Бесплатно</span>
            </div>
            <div className="flex justify-between">
              <span>Материал рамки: пластик</span>
              <span>1000 Р</span>
            </div>
            <div className="flex justify-between">
              <span>Цвет рамки: белый</span>
              <span>1000 Р</span>
            </div>
            <div className="flex justify-between">
              <span>Фото: 2 шт</span>
              <span>1000 Р</span>
            </div>
            <div className="flex justify-between">
              <span>Доставка</span>
              <span>900 Р</span>
            </div>
          </div>
          <div className="border-t my-6"></div>
          <div className="flex justify-between font-bold text-lg">
            <span>Итого к оплате</span>
            <span>25 000 Р</span>
          </div>
          <button className="mt-8 w-full md:w-auto bg-[#EAC25F] text-black font-bold py-4 px-8 rounded-full flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-colors">
            <span>ПЕРЕЙТИ К ОПЛАТЕ</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Painter;

