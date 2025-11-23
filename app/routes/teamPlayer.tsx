import { NavLink, Outlet, useParams } from "react-router";
import clsx from "clsx";
import Banner from "./team-player/banner";

function TeamPlayerPage() {
  const { id } = useParams();
  return (
    <section className="team-player-banner">
      <Banner />
      <div className="container flex gap-1 sm:gap-4 py-7.5 sm:py-16">
        <NavLink
          end
          to={`/team-player/${id}`}
          className={clsx(
            "flex items-center justify-center text-center py-1 sm:py-2 px-2 sm:px-4 text-[0.5rem] sm:text-sm md:text-base lg:text-xl border-1 border-[var(--border-dark)] border-solid  rounded-full uppercase"
          )}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "var(--bg-dark)" : "var(--bg-primary)",
            color: isActive ? "var(--text-secondary)" : "var(--text-primary)",
          })}
        >
          ТЕКУЩИЕ СОБЫТИЯ
        </NavLink>
        <NavLink
          to={`/team-player/${id}/upcoming-events`}
          className={clsx(
            "flex items-center justify-center text-center py-1 sm:py-2 px-2 sm:px-4 text-[0.5rem] sm:text-sm md:text-base lg:text-xl  border-1 border-[var(--border-dark)] border-solid  rounded-full uppercase"
          )}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "var(--bg-dark)" : "var(--bg-primary)",
            color: isActive ? "var(--text-secondary)" : "var(--text-primary)",
          })}
        >
          предстоящиЕ события
        </NavLink>
        <NavLink
          to={`/team-player/${id}/sales-history`}
          className={clsx(
            "flex items-center justify-center text-center py-1 sm:py-2 px-2 sm:px-4 text-[0.5rem] sm:text-sm md:text-base lg:text-xl  border-1 border-[var(--border-dark)] border-solid  rounded-full uppercase"
          )}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "var(--bg-dark)" : "var(--bg-primary)",
            color: isActive ? "var(--text-secondary)" : "var(--text-primary)",
          })}
        >
          ИСТОРИЯ продаж
        </NavLink>
      </div>
      <div>
        <Outlet />
      </div>
    </section>
  );
}

export default TeamPlayerPage;
