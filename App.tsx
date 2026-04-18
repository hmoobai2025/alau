import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { Features, FeatureKey, ToastState } from './types';
import { UI_STYLES, FEATURES_CONFIG } from './constants';
import { generateGamePrompts } from './services/geminiService';
import { WandIcon } from './components/icons/WandIcon';
import { LoaderIcon } from './components/icons/LoaderIcon';
import { PromptCard } from './components/PromptCard';

const ZALO_GROUPS = [
    { name: 'Nhóm ứng dụng AI vào SKKN', url: 'https://zalo.me/g/yqeoug502' },
    { name: 'Nhóm ứng dụng AI tạo VIDEO', url: 'https://zalo.me/g/ewkybv680' },
    { name: 'Nhóm ứng dụng AI vào giảng dạy', url: 'https://zalo.me/g/vaubpb682' },
    { name: 'Nhóm tạo Video từ SGK', url: 'https://zalo.me/g/tncmdq530' },
    { name: 'Nhóm nhận học liệu, học tập', url: 'https://zalo.me/g/uditpr888' },
];

const POPUP_DELAYS = [30 * 1000, 40 * 1000, 60 * 1000, 120 * 1000];

const App: React.FC = () => {
    const [gameIdea, setGameIdea] = useState('');
    const [promptCount, setPromptCount] = useState(3);
    const [uiStyle, setUiStyle] = useState('Phong cách 3D dễ thương');
    const [customUiStyle, setCustomUiStyle] = useState('');
    const [features, setFeatures] = useState<Features>({
        studentName: true, leaderboard: true, soundEffects: true, backgroundMusic: true,
        musicToggle: true, localStorage: false, disableRightClick: false,
        disableF12: false, obfuscateCode: false,
    });
    const [creatorName, setCreatorName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupShowCount, setPopupShowCount] = useState(0);
    const [progress, setProgress] = useState(0);

    const popupTimerRef = useRef<number | null>(null);
    const progressIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (popupShowCount < POPUP_DELAYS.length) {
            popupTimerRef.current = window.setTimeout(() => {
                setIsPopupVisible(true);
            }, POPUP_DELAYS[popupShowCount]);
        }
        return () => {
            if (popupTimerRef.current) {
                clearTimeout(popupTimerRef.current);
            }
        };
    }, [popupShowCount]);

    const handleClosePopup = () => {
        setIsPopupVisible(false);
        setPopupShowCount(prev => prev + 1);
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Đã sao chép prompt!', 'success');
    };

    const handleFeatureChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFeatures(prev => ({ ...prev, [name]: checked }));
    };

    const handleGeneratePrompts = useCallback(async () => {
        if (!gameIdea.trim()) {
            showToast('Vui lòng nhập ý tưởng trò chơi.', 'error');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedPrompts([]);
        setProgress(0);

        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = window.setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    return 95;
                }
                const increment = Math.random() * 5;
                return Math.min(prev + increment, 95);
            });
        }, 300);

        const selectedUiStyle = uiStyle === 'Tùy chỉnh...' ? customUiStyle : uiStyle;
        const metaPrompt = `
Với vai trò là một chuyên gia thiết kế game giáo dục và kỹ sư prompt cho AI, hãy tạo ra ${promptCount} câu lệnh (prompt) chuyên sâu và vô cùng chi tiết để yêu cầu Gemini tạo một trò chơi tương tác.

**Ý tưởng gốc của người dùng:** "${gameIdea}"

Mỗi prompt bạn tạo ra phải là một kịch bản hoàn chỉnh, tích hợp đầy đủ và logic các yếu tố sau:

1.  **Mục tiêu giáo dục:** Trò chơi phải có tính giáo dục cao, giúp người chơi học hỏi và rèn luyện kỹ năng một cách tự nhiên, không gượng ép.
2.  **Luật chơi & Gameplay:** Mô tả rõ ràng, chi tiết cách chơi, các vòng chơi, cách tính điểm, và điều kiện thắng/thua. Phải đảm bảo logic game chặt chẽ.
3.  **Phong cách giao diện:** "${selectedUiStyle}". Hãy mô tả chi tiết các yếu tố hình ảnh, màu sắc, nhân vật, và hiệu ứng theo phong cách này để tạo ra một giao diện bắt mắt.
4.  **Yếu tố đồ họa (Rất quan trọng):** Tuyệt đối không sử dụng URL hình ảnh. Thay vào đó, hãy sử dụng các icon từ thư viện (ví dụ: Font Awesome, Lucide) hoặc các EMOJI phù hợp để minh họa cho các đối tượng trong trò chơi.
5.  **Các tính năng bắt buộc:**
    ${features.studentName ? "- Phải có ô cho người chơi nhập tên trước khi bắt đầu.\n" : ""}
    ${features.leaderboard ? "- Phải có bảng xếp hạng để hiển thị điểm số cao.\n" : ""}
    ${features.soundEffects ? "- Phải có các hiệu ứng âm thanh (tạo bằng tone.js, không dùng link ngoài) khi tương tác (ví dụ: trả lời đúng/sai, click nút).\n" : ""}
    ${features.backgroundMusic ? "- Phải có nhạc nền vui nhộn, phù hợp với chủ đề.\n" : ""}
    ${features.musicToggle ? "- Phải có nút để tắt/bật nhạc nền.\n" : ""}
    ${features.localStorage ? "- Phải sử dụng Local Storage để lưu trữ dữ liệu (ví dụ: điểm cao, tên người chơi).\n" : ""}
6.  **Yêu cầu về Bảo mật & Tối ưu hóa:**
    ${features.disableRightClick ? "- Tích hợp mã JavaScript để vô hiệu hóa chức năng chuột phải trên toàn bộ trang.\n" : ""}
    ${features.disableF12 ? "- Tích hợp mã JavaScript để vô hiệu hóa phím F12 và các tổ hợp phím mở công cụ cho nhà phát triển (Developer Tools).\n" : ""}
    ${features.obfuscateCode ? "- Tối ưu hóa và rút gọn code JavaScript để khó đọc hơn nhưng vẫn đảm bảo hiệu năng.\n" : ""}
7.  **Bản quyền:**
    ${creatorName ? `- Hiển thị thông tin người sáng tạo ở cuối trang: "${creatorName}".\n` : ""}

**Yêu cầu đầu ra (Rất quan trọng):**
-   Đánh số mỗi prompt rõ ràng (ví dụ: **Prompt 1:**, **Prompt 2:**).
-   Sử dụng định dạng **Markdown** để trình bày nội dung cho dễ đọc. Cấu trúc mỗi prompt phải bao gồm các đề mục rõ ràng như: **### 🎮 Tên Trò Chơi Gợi Ý:**, **### 🎯 Mục Tiêu Giáo Dục:**, **### 📜 Luật Chơi & Gameplay:**, **### 🎨 Phong Cách Giao Diện:**, **### ✨ Tính Năng Đặc Biệt:**, và **### 📝 Yêu Cầu Kỹ Thuật:**.
-   Tuyệt đối không viết tắt, viết ẩu. Ngôn ngữ phải chuyên nghiệp, chi tiết và đầy đủ.
-   Phân tách mỗi prompt đã tạo bằng chuỗi ký tự "---PROMPT-SEPARATOR---".
        `;

        try {
            const prompts = await generateGamePrompts(metaPrompt);
            setGeneratedPrompts(prompts);
        } catch (err: any) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 500);
        }
    }, [gameIdea, promptCount, uiStyle, customUiStyle, features, creatorName]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <img src="https://dangkyhoc.com/logo.png" alt="Logo" className="mx-auto h-24 w-auto mb-4" />
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 pb-2">
                        Công Cụ Tối Ưu Ý Tưởng Trò Chơi
                    </h1>
                    <p className="text-lg text-slate-400 mt-2">
                        Biến ý tưởng của bạn thành các prompt game chuyên sâu cho Gemini AI.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cột trái: Cài đặt */}
                    <aside className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">1. Ý Tưởng Cốt Lõi</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="gameIdea" className="block text-sm font-medium text-slate-300 mb-1">Ý Tưởng Trò Chơi</label>
                                    <textarea id="gameIdea" value={gameIdea} onChange={(e) => setGameIdea(e.target.value)} placeholder="Ví dụ: Trò chơi học từ vựng tiếng Anh" className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition resize-y h-28" />
                                </div>
                                <div>
                                    <label htmlFor="creatorName" className="block text-sm font-medium text-slate-300 mb-1">Tên Người Sáng Tạo (Bản quyền)</label>
                                    <input id="creatorName" type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Ví dụ: Thầy Được Sáng Tạo" className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">2. Tùy Chỉnh</h2>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="promptCount" className="block text-sm font-medium text-slate-300 mb-1">Số Lượng Prompt (1-5)</label>
                                    <input id="promptCount" type="number" value={promptCount} onChange={(e) => setPromptCount(Math.max(1, Math.min(5, parseInt(e.target.value, 10) || 1)))} min="1" max="5" className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" />
                                </div>
                                <div>
                                    <label htmlFor="uiStyle" className="block text-sm font-medium text-slate-300 mb-1">Phong Cách Giao Diện</label>
                                    <select id="uiStyle" value={uiStyle} onChange={(e) => setUiStyle(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition">
                                        {UI_STYLES.map(style => <option key={style}>{style}</option>)}
                                        <option value="custom">Tùy chỉnh...</option>
                                    </select>
                                    {uiStyle === 'custom' && <input type="text" value={customUiStyle} onChange={(e) => setCustomUiStyle(e.target.value)} placeholder="Mô tả phong cách của bạn" className="mt-2 w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" />}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Tính Năng</label>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                        {FEATURES_CONFIG.map(({ key, label }) => (
                                            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input type="checkbox" name={key} checked={features[key as FeatureKey]} onChange={handleFeatureChange} className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 text-orange-500 rounded focus:ring-orange-500" />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleGeneratePrompts} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all hover:bg-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100">
                            {isLoading ? <LoaderIcon className="h-5 w-5" /> : <WandIcon className="h-5 w-5" />}
                            <span>{isLoading ? 'Đang tạo...' : 'Tạo Prompts'}</span>
                        </button>
                    </aside>

                    {/* Cột phải: Kết quả */}
                    <div className="lg:col-span-8">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-full min-h-[600px] flex flex-col">
                            <h2 className="text-xl font-bold text-white mb-4">3. Kết Quả Prompts</h2>
                            <div className="bg-slate-900/70 border border-slate-700/50 rounded-lg p-4 flex-grow overflow-y-auto">
                                {isLoading && (
                                  <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
                                    <LoaderIcon className="h-10 w-10 mb-4" />
                                    <p className="text-lg mb-4">AI đang phân tích và tạo prompts...</p>
                                    <div className="w-full max-w-md bg-slate-700 rounded-full h-2.5">
                                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-sm mt-2 font-mono">{Math.round(progress)}%</p>
                                    <p className="text-sm mt-4">Việc này có thể mất một chút thời gian.</p>
                                  </div>
                                )}
                                {error && <div className="h-full flex flex-col justify-center items-center text-center text-red-400"><strong className="text-lg">Đã Xảy Ra Lỗi</strong><p className="mt-2 text-sm max-w-md">{error}</p></div>}
                                {!isLoading && !error && generatedPrompts.length === 0 && <div className="h-full flex flex-col justify-center items-center text-center text-slate-500"><WandIcon className="h-16 w-16 mb-4" /><p className="text-lg">Các prompt được tạo sẽ xuất hiện ở đây.</p></div>}
                                <div className="space-y-6">
                                  {generatedPrompts.map((prompt, index) => (
                                      <PromptCard key={index} prompt={prompt} onCopy={copyToClipboard} />
                                  ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                <footer className="text-center mt-12 text-slate-500 text-sm">
                     <div className="mb-4">
                        <h3 className="text-slate-400 font-semibold mb-2">Cùng tham gia học tập:</h3>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                            {ZALO_GROUPS.map(group => (
                                <a key={group.name} href={group.url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 transition-colors">
                                    {group.name}
                                </a>
                            ))}
                        </div>
                    </div>
                    <p>Phát triển bởi Nguyễn Thành Được. Bản quyền © 2024</p>
                </footer>

                {isPopupVisible && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full p-6 text-center relative animate-popup-in">
                            <button onClick={handleClosePopup} className="absolute top-2 right-2 text-slate-500 hover:text-slate-200 transition-colors" aria-label="Close popup">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <img src="https://dangkyhoc.com/logo.png" alt="Logo" className="mx-auto h-16 w-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">Cùng tham gia học tập</h3>
                            <div className="space-y-2 text-left">
                                {ZALO_GROUPS.map(group => (
                                    <a key={group.url} href={group.url} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-slate-700 hover:bg-orange-600 p-3 rounded-md text-slate-200 hover:text-white font-semibold transition-all duration-200 transform hover:scale-105">
                                        {group.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg text-white font-semibold animate-fade-in-out ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {toast.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;

// Minimal CSS for toast animation if Tailwind JIT doesn't pick it up
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-out {
    0% { opacity: 0; transform: translateY(20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(20px); }
  }
  .animate-fade-in-out {
    animation: fade-in-out 3s ease-in-out forwards;
  }
  @keyframes popup-in {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-popup-in {
    animation: popup-in 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);
