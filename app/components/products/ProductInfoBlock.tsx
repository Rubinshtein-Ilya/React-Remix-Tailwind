import { useTranslation } from "react-i18next";
import PlaceBetBlock from "./PlaceBetBlock";
import AddToCartBlock from "./AddToCartBlock";
import type { IItem } from "server/models/Item";
import type { LikeResponse } from "~/types/item";
import type { IPlayer } from "server/models/Player";
import LabelChip from "~/shared/carousel/LabelChip";
import { Link } from "react-router";
import type { IEventMinified } from "../../../server/models/shared/EventMinifiedSchema";

interface IProps {
  item: IItem;
  player?: LikeResponse<IPlayer>;
  lastBetName?: string;
  event?: IEventMinified;
  blockClasses?: string;
}

function ProductInfoBlock({
  item,
  player,
  lastBetName,
  blockClasses,
  event,
}: IProps) {
  const { t } = useTranslation();
  return (
    <div className={`pt-0 lg:pt-8 flex flex-col ${blockClasses}`}>
      {/* chips */}
      <div className="flex items-center gap-2.5">
        {item.labels?.map((label, index) => (
          <LabelChip key={label} labelId={label} />
        ))}
      </div>
      {/* title */}
      <h2
        className={`text-[30px] text-[var(--text-primary)] font-medium pt-0 sm:pt-5`}
      >
        {item.title}
      </h2>

      {/* team */}
      {player?.team && (
        <div className="pt-0 sm:pt-5 text-base text-[var(--text-primary)] font-medium uppercase">
          {player?.team?.name || t("singleProduct.team.name")}
        </div>
      )}
      {/* description */}
      <p className="pt-2 sm:pt4 text-base text-[var(--text-primary)] font-normal leading-5 text-pretty">
        {item.description || t("singleProduct.description")}
      </p>
      {/* place bet block */}

      <div className="mt-4 sm:mt-4">
        {item.salesMethod === "bidding" ? (
          <PlaceBetBlock
            expiredAt={
              new Date(item.endDate || Date.now() + 24 * 60 * 60 * 1000)
            }
            maxBet={item.price}
            itemId={item._id}
            size={Object.keys(item.stockBySize || {})[0] || "oneSize"}
            productImage={
              item.thumbnail ||
              item.images?.[0] ||
              "/images/products/cafu-tshirt.png"
            }
            productName={item.title}
            item={item}
            lastBetName={lastBetName}
          />
        ) : (
          <AddToCartBlock
            itemId={item._id}
            price={item.price}
            productName={item.title}
            item={item}
          />
        )}
      </div>

      {/*{player?.team?.image && (*/}
      {/*  <div className="flex items-center gap-2  mt-7.5 mb-7.5 lg:mb-0">*/}
      {/*    <div className="w-13 h-13 rounded-full  shrink-0">*/}
      {/*      <img*/}
      {/*        src={player?.team?.image || "/images/products/imageteamLogo.png"}*/}
      {/*        alt="team logo"*/}
      {/*        className="w-full h-full object-cover"*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*    <div className="text-base text-[var(--text-primary)] font-medium">*/}
      {/*      {t("singleProduct.team.officialPartner")}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}

      {player && (
        <Link
          to={`/players/${player._id}`}
          className="flex items-center gap-2 mt-7.5 mb-7.5 lg:mb-0"
        >
          <div className="w-13 h-13 rounded-full overflow-hidden shrink-0">
            <img
              src={player.thumbnail || player.images[0]}
              alt="team logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="pl-2">
            <div className="text-base text-[var(--text-primary)] font-medium">
              {`${player.name} ${player.lastName}`}
            </div>
            {player.isPartner && (
              <div className="text-base text-[var(--text-primary)] font-small">
                {t("singleProduct.player.officialPartner")}
              </div>
            )}
          </div>
        </Link>
      )}
      {event && (
        <Link
          to={`/events/${event.slug}`}
          className="flex items-center gap-2 mt-7.5 mb-7.5 lg:mb-0"
        >
          <div className="w-13 h-13 rounded-full overflow-hidden shrink-0">
            <img
              src={event.image}
              alt="team logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="pl-2">
            <div className="text-base text-[var(--text-primary)] font-medium">
              {`${event.name}`}
            </div>
            <div className="text-base text-[var(--text-primary)] font-small">
              {t("singleProduct.player.officialPartner")}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}

export default ProductInfoBlock;
