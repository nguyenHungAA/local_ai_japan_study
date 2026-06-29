import { CgViewSplit, CgSearch, CgCircleci } from "react-icons/cg";
import { IoLibraryOutline } from "react-icons/io5";
import { LuSquarePen } from "react-icons/lu";
import { VscGithubProject } from "react-icons/vsc";
import { GrAppsRounded } from "react-icons/gr";
const Sidebar = () => {
    return (
        <section id="sidebar">
            {/* top section */}
            <div className="sidebar-top">
                <div>
                    <a href="/">
                        <CgCircleci size={20} />
                    </a>
                </div>
                <div>
                    <CgViewSplit size={20} />
                </div>
            </div>

            {/* List section */}
            <ul className="sidebar-list">
                <li className="sidebar-list-item">
                    <button>
                        <LuSquarePen size={20} />
                        New chat
                    </button>
                </li>
                <li className="sidebar-list-item">
                    <button>
                        <CgSearch size={18} />
                        Search chats
                    </button>
                </li>
                <li className="sidebar-list-item">
                    <button>
                        <IoLibraryOutline size={18} />
                        Library
                    </button>
                </li>
                <li className="sidebar-list-item">
                    <button>
                        <VscGithubProject size={18} />
                        Projects
                    </button>
                </li>
                <li className="sidebar-list-item">
                    <button>
                        <GrAppsRounded size={18} />
                        Apps
                    </button>
                </li>
            </ul>

            {/* Chat history */}

        </section>
    )
}

export default Sidebar;