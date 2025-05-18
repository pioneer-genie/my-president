// 설문 데이터를 가져오는 함수
async function fetchSurveyData() {
    try {
        const response = await fetch('src/data/promises.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        
        // 데이터 구조 변환
        const surveyData = Object.entries(rawData).map(([topic, candidates]) => {
            const choices = Object.entries(candidates).map(([candidate, data], index) => ({
                candidate: candidate,
                text: data.요약,
                original: data.원본,
                originalPosition: index + 1 // 원래 위치 기록 (1-based)
            }));
            
            // 선택지 순서 랜덤화
            const shuffledChoices = shuffleArray([...choices]).map((choice, index) => ({
                ...choice,
                displayPosition: index + 1 // 표시되는 위치 (1-based)
            }));
            
            return {
                topic: topic,
                choices: shuffledChoices,
                showOriginal: false
            };
        });
        
        return surveyData;
    } catch (error) {
        console.error('설문 데이터를 불러오는데 실패했습니다:', error);
        return [];
    }
}

// 모달을 표시하는 함수
function showModal(topic, choices) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">${topic} - 상세 공약</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    ${choices.map(choice => `
                        <div class="border-b pb-4">
                            <h3 class="font-semibold text-lg mb-2">${choice.candidate}</h3>
                            <div class="space-y-2">
                                ${choice.original.map(item => `
                                    <p class="text-gray-700">${item}</p>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
}

// 모달을 닫는 함수
window.closeModal = function() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.remove();
    }
};

// 설문 카드를 생성하는 함수
function createSurveyCard(topic, choices, showOriginal) {
    return `
        <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">${topic}</h2>
                <button 
                    onclick="toggleOriginal('${topic}')"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    ${showOriginal ? '요약 보기' : '자세히 보기'}
                </button>
            </div>
            <div class="space-y-3">
                ${choices.map((choice, index) => `
                    <button 
                        class="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                        data-candidate="${choice.candidate}"
                        onclick="window.selectAnswer('${choice.candidate}', ${choice.originalPosition}, ${choice.displayPosition})"
                    >
                        ${showOriginal ? 
                            choice.original.map((item, idx) => `
                                <div class="${idx > 0 ? 'border-t border-gray-200 pt-2 mt-2' : ''}">
                                    <p class="text-gray-700">${item}</p>
                                </div>
                            `).join('') :
                            choice.text
                        }
                    </button>
                `).join('')}
                <button 
                    class="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
                    data-candidate="none"
                    onclick="window.selectAnswer('none', 0, ${choices.length + 1})"
                >
                    마음에 드는 내용이 없음
                </button>
            </div>
        </div>
    `;
}

// 원본/요약 토글 함수
window.toggleOriginal = function(topic) {
    const questionIndex = surveyData.findIndex(q => q.topic === topic);
    if (questionIndex !== -1) {
        surveyData[questionIndex].showOriginal = !surveyData[questionIndex].showOriginal;
        renderQuestion();
    }
};

// 답변을 선택하는 함수
window.selectAnswer = function(candidate, originalPosition, displayPosition) {
    // 로컬 스토리지에 답변 저장
    const answers = JSON.parse(localStorage.getItem('surveyAnswers') || '[]');
    answers.push({
        candidate: candidate,
        originalPosition: originalPosition,
        displayPosition: displayPosition,
        selectedPosition: currentQuestion + 1
    });
    localStorage.setItem('surveyAnswers', JSON.stringify(answers));
    
    // 다음 질문으로 이동
    currentQuestion++;
    if (currentQuestion < surveyData.length) {
        renderQuestion();
    } else {
        showResults();
    }
};

// 현재 질문을 렌더링하는 함수
function renderQuestion() {
    const question = surveyData[currentQuestion];
    const container = document.getElementById('survey-container');
    if (!container) {
        console.error('survey-container를 찾을 수 없습니다.');
        return;
    }
    container.innerHTML = `
        <div class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${(currentQuestion / surveyData.length) * 100}%"></div>
            </div>
            <p class="text-sm text-gray-600 mt-2">${currentQuestion + 1} / ${surveyData.length}</p>
        </div>
        ${createSurveyCard(question.topic, question.choices, question.showOriginal)}
    `;
}

// 후보 매핑 정보
const candidateMapping = {
    '이재명': 'A',  // 기호 1번
    '김문수': 'B',  // 기호 2번
    '이준석': 'C'   // 기호 4번
};

// 후보 매핑 역변환
const reverseCandidateMapping = {
    'A': '이재명',
    'B': '김문수',
    'C': '이준석',
    'N': 'none'
};

// 후보 순서 정의 (기호 번호 순)
const candidateOrder = ['이재명', '김문수', '이준석'];

// 배열을 랜덤하게 섞는 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 결과 URL 암호화/복호화 함수
const resultCipher = {
    // 결과 문자열을 암호화
    encrypt: function(result) {
        // 결과 문자열을 Base64로 인코딩
        const encoded = btoa(result);
        // URL에서 안전하게 사용할 수 있도록 추가 인코딩
        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },
    
    // 암호화된 결과를 복호화
    decrypt: function(encrypted) {
        try {
            // URL 안전 문자를 원래 Base64 문자로 복원
            const restored = encrypted.replace(/-/g, '+').replace(/_/g, '/');
            // Base64 디코딩
            return atob(restored);
        } catch (error) {
            console.error('결과 복호화 실패:', error);
            return '';
        }
    }
};

// 앱 초기화
let surveyData = [];
let currentQuestion = 0;

async function init() {
    try {
        // 설문 데이터 먼저 로드
        surveyData = await fetchSurveyData();
        if (surveyData.length === 0) {
            throw new Error('설문 데이터를 불러오는데 실패했습니다.');
        }

        // URL에서 결과 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const resultParam = urlParams.get('r'); // 'result' 대신 'r' 사용
        
        if (resultParam) {
            // URL에서 결과를 복호화
            const decryptedResult = resultCipher.decrypt(resultParam);
            if (!decryptedResult) {
                throw new Error('잘못된 결과 URL입니다.');
            }

            // 복호화된 결과를 파싱
            const answers = [];
            for (let i = 0; i < decryptedResult.length; i += 2) {
                const displayPosition = decryptedResult[i];
                const candidateId = decryptedResult[i + 1];
                answers.push({
                    candidate: reverseCandidateMapping[candidateId],
                    displayPosition: parseInt(displayPosition)
                });
            }
            localStorage.setItem('surveyAnswers', JSON.stringify(answers));
            currentQuestion = surveyData.length;
            showResults();
        } else {
            // 새로운 설문 시작 시 이전 결과 초기화
            localStorage.removeItem('surveyAnswers');
            renderQuestion();
        }
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        document.getElementById('survey-container').innerHTML = `
            <div class="text-center text-red-600">
                ${error.message || '오류가 발생했습니다.'}
            </div>
        `;
    }
}

// DOM이 로드된 후 앱 시작
document.addEventListener('DOMContentLoaded', init);

// 결과를 보여주는 함수
function showResults() {
    const answers = JSON.parse(localStorage.getItem('surveyAnswers') || '[]');
    const scores = {};
    
    // 각 후보별 점수 계산
    answers.forEach(answer => {
        if (answer.candidate !== 'none') {  // 'none' 선택은 점수 계산에서 제외
            scores[answer.candidate] = (scores[answer.candidate] || 0) + 1;
        }
    });
    
    // 가장 높은 점수를 받은 후보 찾기
    const winner = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
    
    const container = document.getElementById('survey-container');
    if (!container) {
        console.error('survey-container를 찾을 수 없습니다.');
        return;
    }

    // 결과 URL 생성 (표시 위치 + 후보 ID)
    const resultData = answers.map(answer => 
        `${answer.displayPosition}${answer.candidate === 'none' ? 'N' : candidateMapping[answer.candidate]}`
    ).join('');
    
    // 결과 암호화
    const encryptedResult = resultCipher.encrypt(resultData);
    const resultUrl = `${window.location.origin}${window.location.pathname}?r=${encryptedResult}`;
    
    // 결과 표시
    container.innerHTML = `
        <div class="text-center px-2 sm:px-4">
            <h2 class="text-2xl font-bold mb-4">결과</h2>
            ${winner === 'none' ? 
                '<p class="text-xl mb-6">마음에 드는 공약이 없었습니다.</p>' :
                `<p class="text-xl mb-6">나와 가장 맞는 후보는 ${winner}입니다!</p>
                <!-- 후보자 포스터 표시 -->
                <div class="mb-8">
                    <img 
                        src="${winner === '이재명' ? 'no1.jpg' : winner === '김문수' ? 'no2.jpg' : 'no4.jpg'}" 
                        alt="${winner} 후보 포스터"
                        class="mx-auto w-full max-w-[280px] sm:max-w-sm rounded-lg shadow-lg"
                    >
                </div>`
            }

            <div class="mb-8">
                <h3 class="text-lg font-semibold mb-2">상세 점수</h3>
                ${candidateOrder.map(candidate => `
                    <p class="mb-1">${candidate}: ${scores[candidate] || 0}점</p>
                `).join('')}
            </div>
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        class="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
                        onclick="window.shareResult()"
                    >
                        결과 공유하기
                    </button>
                    <button 
                        class="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                        onclick="window.restartSurvey()"
                    >
                        다시하기
                    </button>
                </div>
                <div class="mt-4">
                    <p class="text-sm text-gray-600 mb-2">또는 아래 링크를 공유하세요:</p>
                    <div class="relative">
                        <input 
                            type="text" 
                            value="${resultUrl}" 
                            readonly 
                            class="w-full p-2 pr-10 border rounded text-sm"
                            onclick="this.select()"
                        >
                        <button 
                            onclick="window.copyToClipboard('${resultUrl}')"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            title="클립보드에 복사"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 카테고리별 선택 내역 테이블 -->
            <div class="mt-12">
                <h3 class="text-lg font-semibold mb-4">카테고리별 공약 비교</h3>
                <div class="overflow-x-auto -mx-2 sm:mx-0">
                    <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-2 sm:px-4 py-2 sm:py-3 border-b text-center text-xs sm:text-sm font-semibold text-gray-600">카테고리</th>
                                ${candidateOrder.map(candidate => `
                                    <th class="px-2 sm:px-4 py-2 sm:py-3 border-b text-center text-xs sm:text-sm font-semibold text-gray-600">${candidate}</th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${surveyData.map((question, index) => {
                                const answer = answers[index];
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 border-r text-center">${question.topic}</td>
                                        ${candidateOrder.map(candidate => {
                                            const choice = question.choices.find(c => c.candidate === candidate);
                                            const isSelected = answer.candidate === candidate;
                                            const hasPromise = choice && choice.text;
                                            return `
                                                <td class="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm ${hasPromise ? 'text-gray-900' : 'text-gray-400 bg-gray-50'} ${isSelected ? 'bg-green-50' : ''} text-center">
                                                    <div class="max-w-[120px] sm:max-w-md mx-auto">
                                                        ${hasPromise ? choice.text : '공약 정보 없음'}
                                                    </div>
                                                </td>
                                            `;
                                        }).join('')}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 공유 함수
window.shareResult = async function() {
    const shareData = {
        title: '나와 맞는 대선 후보 찾기',
        text: '나와 맞는 대선 후보를 찾아보세요!',
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Web Share API를 지원하지 않는 경우
            const input = document.querySelector('input[readonly]');
            input.select();
            document.execCommand('copy');
            alert('링크가 복사되었습니다. 원하는 곳에 붙여넣기 해주세요.');
        }
    } catch (err) {
        console.error('공유하기 실패:', err);
        // 공유 실패 시 수동 복사 안내
        const input = document.querySelector('input[readonly]');
        input.select();
        document.execCommand('copy');
        alert('링크가 복사되었습니다. 원하는 곳에 붙여넣기 해주세요.');
    }
};

// 클립보드에 복사하는 함수
window.copyToClipboard = function(text) {
    // 임시 textarea 엘리먼트 생성
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';  // 스크롤 방지
    textarea.style.opacity = '0';       // 보이지 않게
    document.body.appendChild(textarea);
    
    try {
        // 텍스트 선택
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        
        // 복사 명령 실행
        const successful = document.execCommand('copy');
        if (successful) {
            // 복사 성공 시 피드백
            const button = event.currentTarget;
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            `;
            setTimeout(() => {
                button.innerHTML = originalHTML;
            }, 2000);
        } else {
            throw new Error('복사 실패');
        }
    } catch (err) {
        console.error('클립보드 복사 실패:', err);
        alert('클립보드 복사에 실패했습니다. 직접 복사해주세요.');
    } finally {
        // 임시 엘리먼트 제거
        document.body.removeChild(textarea);
    }
};

// 다시하기 함수 추가
window.restartSurvey = function() {
    // 로컬 스토리지 초기화
    localStorage.removeItem('surveyAnswers');
    // 현재 질문 초기화
    currentQuestion = 0;
    // 첫 질문 렌더링
    renderQuestion();
}; 