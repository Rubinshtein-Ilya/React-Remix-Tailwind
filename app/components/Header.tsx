import { Link, useNavigate } from "react-router";
import { LoginModal } from "../components/Dialogs/LoginModal";
import { MobileMenu } from "./MobileMenu";
import { CartPanel } from "./Dialogs/CartPanel";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserMenu } from "./UserMenu";
import { useUser } from "~/queries/auth";
import { useCart } from "~/queries/cart";
import { Tooltip } from "~/shared/Tooltip";
import logoSVG from "../assets/images/logo.svg";
import { cn } from "~/lib/utils";
import { SearchDropdown } from "~/components/SearchDropdown";
import { PendingDropdown } from "~/components/Navigation/PendingDropdown";

export function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);
  const { t } = useTranslation();
  const { user, loading, logout } = useUser();
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Данные корзины (только если пользователь авторизован)
  const { data: cartData, isLoading: cartLoading } = useCart();
  const cartItems = cartData?.cart ? Object.values(cartData.cart.items || {}) : [];
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price + Math.ceil(item.price * 0.1)) * item.amount, 0);

  // Обработка кликов вне поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideDesktopSearch = searchContainerRef.current?.contains(event.target as Node);
      const isClickInsideMobileSearch = mobileSearchContainerRef.current?.contains(event.target as Node);

      if (!isClickInsideDesktopSearch && !isClickInsideMobileSearch) {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Обработка изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchDropdownOpen(value.length >= 2);
  };

  // Обработка фокуса на поисковом поле
  const handleSearchFocus = () => {
    if (searchQuery.length >= 2) {
      setIsSearchDropdownOpen(true);
    }
  };

  // Закрытие поиска
  const handleSearchClose = () => {
    setIsSearchDropdownOpen(false);
  };

  // Обработка нажатия клавиш
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchDropdownOpen(false);
    } else if (e.key === "Escape") {
      setIsSearchDropdownOpen(false);
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    navigate("/profile/my-wishlist");
  };

  const handleCartClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsCartPanelOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full backdrop-blur-sm z-40" style={{ backgroundColor: "var(--header-bg)" }}>
        {/* Верхняя строка навигации */}
        <div className="border-b border-[#F1F1F1] hidden lg:block">
          <nav className="container mx-auto px-4 py-2">
            <div className="flex justify-end">
              <div className="flex items-center gap-6">
                <Link to="/about" className="text-[14px] hover:opacity-80 transition" style={{ color: "#121212" }}>
                  {t("header.nav.about_service")}
                </Link>
                <Link to="/framing" className="text-[14px] hover:opacity-80 transition" style={{ color: "#121212" }}>
                  {t("header.nav.framing")}
                </Link>
                <Link to="/partners" className="text-[14px] hover:opacity-80 transition" style={{ color: "#121212" }}>
                  {t("header.nav.our_partners")}
                </Link>
                <Link to="/authenticate" className="text-[14px] hover:opacity-80 transition" style={{ color: "#121212" }}>
                  {t("header.nav.authenticate")}
                </Link>
                <Link to="/delivery" className="text-[14px] hover:opacity-80 transition" style={{ color: "#121212" }}>
                  {t("header.nav.delivery")}
                </Link>
                <Link to="/faq" className="text-[14px] hover:opacity-80 transition" style={{ color: "#121212" }}>
                  {t("header.nav.help_contacts")}
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Нижняя строка навигации */}
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Логотип */}
            <Link to="/" className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              <img src={logoSVG} alt="Fan's Dream" className="w-10.5 sm:w-16" />
            </Link>

            <PendingDropdown />
          </div>

          <div className="flex items-center gap-4">
            {/* Поле поиска */}
            <div className="relative hidden lg:block" ref={searchContainerRef}>
              <input
                ref={searchInputRef}
                type="search"
                placeholder={t("header.search")}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                className="w-64 px-4 py-2 rounded-full border-0 focus:ring-2 transition"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              />
              <SearchDropdown
                searchQuery={searchQuery}
                isOpen={isSearchDropdownOpen}
                onClose={handleSearchClose}
                onItemClick={() => setSearchQuery("")}
              />
            </div>

            {/* Иконки */}

            <div className="flex items-center gap-3 sm:gap-5">
              {/* Поиск */}
              <button
                className=" w-6 h-6  sm:w-8 sm:h-8 hover:opacity-80 transition  lg:hidden "
                style={{ color: "var(--text-primary)" }}
                aria-label="Поиск"
                onClick={() => setIsSearch((prev) => !prev)}
              >
                <svg className="w-full h-full" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    id="Vector"
                    d="M15.54 15.54L13.54 13.54"
                    stroke="#121212"
                    strokeOpacity="1.000000"
                    strokeWidth="1.095569"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <path
                    id="Vector"
                    d="M7.54 14.54C3.68 14.54 0.54 11.41 0.54 7.54C0.54 3.68 3.68 0.54 7.54 0.54C11.41 0.54 14.54 3.68 14.54 7.54C14.54 11.41 11.41 14.54 7.54 14.54Z"
                    stroke="#121212"
                    strokeOpacity="1.000000"
                    strokeWidth="1.095569"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Избранное */}
              <Tooltip content={t("header.wishlist_tooltip")} disabled={!!user} position="bottom">
                <button
                  className={cn("w-6 h-6 sm:w-8 sm:h-8 transition", user ? "hover:opacity-80" : "opacity-50 cursor-not-allowed")}
                  style={{ color: "var(--text-primary)" }}
                  aria-label={t("header.wishlist")}
                  onClick={handleWishlistClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 33 32" fill="none">
                    <path
                      d="M17.6563 27.6462C17.2046 27.8056 16.4606 27.8056 16.0089 27.6462C12.156 26.3309 3.54688 20.8439 3.54688 11.5439C3.54688 7.43862 6.85502 4.11719 10.9337 4.11719C13.3517 4.11719 15.4907 5.28633 16.8326 7.09319C18.1744 5.28633 20.3267 4.11719 22.7314 4.11719C26.8102 4.11719 30.1183 7.43862 30.1183 11.5439C30.1183 20.8439 21.5092 26.3309 17.6563 27.6462Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Tooltip>

              {/* Корзина */}
              <div className="relative flex">
                <Tooltip content={t("header.cart_tooltip")} disabled={!!user} position="bottom">
                  <button
                    className={cn("w-6 h-6 sm:w-8 sm:h-8 transition relative", user ? "hover:opacity-80" : "opacity-50 cursor-not-allowed")}
                    style={{ color: "var(--text-primary)" }}
                    aria-label={t("header.cart")}
                    onClick={handleCartClick}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 33 32" fill="none">
                      <path
                        d="M12.0703 18.9297C12.0703 21.4805 14.1695 23.5797 16.7203 23.5797C19.2712 23.5797 21.3703 21.4805 21.3703 18.9297"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.4813 2.6543L7.67188 7.47701"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.959 2.6543L25.7684 7.47701"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.43359 10.4267C3.43359 7.96882 4.74888 7.76953 6.38302 7.76953H27.0556C28.6897 7.76953 30.005 7.96882 30.005 10.4267C30.005 13.2831 28.6897 13.0838 27.0556 13.0838H6.38302C4.74888 13.0838 3.43359 13.2831 3.43359 10.4267Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M5.42773 13.2832L7.30102 24.7621C7.72616 27.3395 8.74916 29.2261 12.5489 29.2261H20.5602C24.692 29.2261 25.3032 27.4192 25.7814 24.9215L28.0134 13.2832"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Счетчик товаров в корзине */}
                    {user && cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                </Tooltip>
              </div>

              {/* Профиль */}
              {!loading && (
                <>
                  {user ? (
                    <UserMenu user={user} onLogout={logout} />
                  ) : (
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className=" w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition"
                      style={{ color: "var(--text-primary)" }}
                      aria-label="Профиль"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 33 32" fill="none">
                        <path
                          d="M16.9937 16.9814C16.9007 16.9682 16.7811 16.9682 16.6748 16.9814C14.3366 16.9017 12.4766 14.9886 12.4766 12.637C12.4766 10.2323 14.4163 8.2793 16.8343 8.2793C19.239 8.2793 21.192 10.2323 21.192 12.637C21.1787 14.9886 19.332 16.9017 16.9937 16.9814Z"
                          stroke="#121212"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M25.788 25.751C23.4232 27.9166 20.2878 29.2318 16.8335 29.2318C13.3792 29.2318 10.2438 27.9166 7.87891 25.751C8.01176 24.5021 8.80891 23.2798 10.2305 22.3233C13.8708 19.9053 19.8228 19.9053 23.4365 22.3233C24.858 23.2798 25.6552 24.5021 25.788 25.751Z"
                          stroke="#121212"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16.8326 29.2296C24.1701 29.2296 30.1183 23.2814 30.1183 15.9439C30.1183 8.60642 24.1701 2.6582 16.8326 2.6582C9.49509 2.6582 3.54688 8.60642 3.54688 15.9439C3.54688 23.2814 9.49509 29.2296 16.8326 29.2296Z"
                          stroke="#121212"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </>
              )}
              {/* Меню */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className=" w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition lg:hidden"
                style={{ color: "var(--text-primary)" }}
                aria-label="Меню"
              >
                <svg className="w-full h-full" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    id="vuesax/linear/menu"
                    rx="0.000000"
                    width="17.250000"
                    height="17.250000"
                    transform="translate(0.375000 0.375000)"
                    fill="#FFFFFF"
                    fillOpacity="0"
                  />
                  <path
                    id="Vector"
                    d="M2.25 5.25L15.75 5.25"
                    stroke="#121212"
                    strokeOpacity="1.000000"
                    strokeWidth="1.100000"
                    strokeLinecap="round"
                  />
                  <path id="Vector" d="M2.25 9L15.75 9" stroke="#121212" strokeOpacity="1.000000" strokeWidth="1.100000" strokeLinecap="round" />
                  <path
                    id="Vector"
                    d="M2.25 12.75L15.75 12.75"
                    stroke="#121212"
                    strokeOpacity="1.000000"
                    strokeWidth="1.100000"
                    strokeLinecap="round"
                  />
                  <g opacity="0.000000" />
                </svg>
              </button>
            </div>
            {/*  */}
          </div>
        </nav>
        {isSearch && (
          <div className={cn("w-full container flex justify-end  pb-4   lg:hidden")}>
            {/* Поле поиска */}
            <div className="relative w-full" ref={mobileSearchContainerRef}>
              <input
                ref={mobileSearchInputRef}
                type="search"
                placeholder={t("header.search")}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-2 rounded-full border focus:ring-2 transition "
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              />
              <SearchDropdown
                searchQuery={searchQuery}
                isOpen={isSearchDropdownOpen}
                onClose={handleSearchClose}
                onItemClick={() => {
                  setSearchQuery("");
                  setIsSearch(false);
                }}
              />
            </div>
          </div>
        )}
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <CartPanel
        isOpen={isCartPanelOpen}
        onClose={() => setIsCartPanelOpen(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        loading={cartLoading}
      />
    </>
  );
}
