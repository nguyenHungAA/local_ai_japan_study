import { useEffect, useState } from "react";
import { CgViewSplit, CgSearch, CgCircleci } from "react-icons/cg";
import { GrAppsRounded } from "react-icons/gr";
import { IoLibraryOutline } from "react-icons/io5";
import { LuSquarePen } from "react-icons/lu";
import { VscGithubProject } from "react-icons/vsc";

import { getConversationHistory } from "../api/conversation";
import { useNavigate } from "react-router";

const Sidebar = ({ conversationHistoryVersion }) => {
    const [chatHistory, setChatHistory] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("local-ai-user-id");
        if (userId) {
            getConversationHistory(userId)
                .then(history => {
                    setChatHistory(history);
                })
                .catch(() => {
                    setChatHistory([]);
                });
        }
    }, [conversationHistoryVersion]);

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
                    <button onClick={() => navigate("/chat/3d")}>
                        <CgSearch size={18} />
                        Chat with 3D model
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
            <div className="sidebar-history">
                <h3>Chat History</h3>
                <ul className="sidebar-history-list">
                    {chatHistory.length > 0 ? (
                        chatHistory.map((chat) => (
                            <li key={chat.id} className="sidebar-history-item">
                                {chat.prompt}
                            </li>
                        ))
                    ) : (
                        <li className="sidebar-history-item">No chat history available</li>
                    )}
                </ul>
            </div>
        </section>
    )
}

export default Sidebar;