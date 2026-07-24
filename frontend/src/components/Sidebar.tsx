import { useEffect, useState } from "react";
import { CgViewSplit, CgSearch, CgCircleci } from "react-icons/cg";
import { GrAppsRounded } from "react-icons/gr";
import { IoLibraryOutline } from "react-icons/io5";
import { LuSquarePen } from "react-icons/lu";
import { VscGithubProject } from "react-icons/vsc";

import { getConversationHistory } from "../api/conversation";

type SidebarProps = {
    parentCallback: (conversationId: string) => void;
    conversationHistoryVersion: number;
};

type ChatHistoryItem = {
    _id: string;
    title?: string;
    message_count?: number;
    last_message_at?: string | null;
};

const Sidebar = ({ parentCallback, conversationHistoryVersion }: SidebarProps) => {
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);


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
                    <button className="button-hover" onClick={() => parentCallback("")} >
                        <LuSquarePen size={20} />
                        New chat
                    </button>
                </li>
                <li className="sidebar-list-item">
                    <button className="button-hover">
                        <CgSearch size={18} />
                        Chat with 3D model
                    </button>
                </li>
                <li className="sidebar-list-item">
                    <button className="button-hover">
                        <IoLibraryOutline size={18} />
                        Library
                    </button>
                </li>
                <li className="sidebar-list-item">
                    <button className="button-hover">
                        <VscGithubProject size={18} />
                        Projects
                    </button>
                </li>
                <li className="sidebar-list-item">
                    <button className="button-hover">
                        <GrAppsRounded size={18} />
                        Apps
                    </button>
                </li>
            </ul>

            {/* Chat history */}
            <div className="sidebar-history">
                <h3>Recents</h3>
                <ul className="sidebar-history-list">
                    {chatHistory.length > 0 ? (
                        chatHistory.map((chat) => (
                            <li
                                key={chat._id}
                                className="sidebar-history-item button-hover"
                                onClick={() => parentCallback(chat._id)}
                            >
                                <button>
                                    {chat.title ?? `Chat ${chat.message_count ?? 0} messages`}
                                </button>
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
