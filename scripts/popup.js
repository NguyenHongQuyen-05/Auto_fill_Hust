const fillButton = document.getElementById("fillForm");
const fillStatus = document.getElementById("fillStatus");

fillButton.addEventListener("click", () => {
    fillButton.disabled = true;
    fillStatus.textContent = "Đang điền đáp án…";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError || !tabs?.[0]?.id) {
            fillButton.disabled = false;
            fillStatus.textContent = "Không tìm thấy tab bài thi đang mở.";
            return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm" }, (response) => {
            fillButton.disabled = false;
            if (chrome.runtime.lastError) {
                fillStatus.textContent = "Chưa kết nối được với bài thi. Hãy mở Microsoft Forms, tải lại trang rồi thử lại.";
                return;
            }
            if (!response || response.status !== "success") {
                fillStatus.textContent = response?.message ?? "Không nhận được kết quả điền đáp án.";
                return;
            }
            fillStatus.textContent = `Đã điền ${response.filledQuestions} câu; ${response.alreadyFilledQuestions} câu đã có đáp án; ${response.unmatchedQuestions} câu chưa khớp. Hãy kiểm tra lại trước khi nộp bài.`;
        });
    });
});
