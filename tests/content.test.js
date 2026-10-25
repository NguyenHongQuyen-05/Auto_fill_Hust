/* Mở content.test.html trong Chrome: kiểm tra trực tiếp bằng DOM và .click(). */
const fixture = document.getElementById("fixture");
const testResults = [];
function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function test(name, run) {
    fixture.replaceChildren();
    chrome.runtime.lastError = undefined;
    try {
        run();
        testResults.push({ name, passed: true });
    } catch (error) {
        testResults.push({ name, passed: false, error: error.message });
    }
}
function mountQuestion(title, choices, type = "radio") {
    const item = document.createElement("div");
    item.dataset.automationId = "questionItem";
    const titleElement = document.createElement("div");
    titleElement.dataset.automationId = "questionTitle";
    const text = document.createElement("span");
    text.className = "text-format-content";
    text.textContent = title;
    titleElement.append(text);
    item.append(titleElement);
    const inputs = choices.map((choice) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = type;
        input.name = `question-${fixture.children.length}`;
        input.value = choice;
        const span = document.createElement("span");
        span.className = "text-format-content";
        span.textContent = choice;
        label.append(input, span);
        item.append(label);
        return input;
    });
    fixture.append(item);
    return inputs;
}
const equivalentQuestion = 'Theo Quy chế đào tạo 2025, điều kiện trùng lặp nội dung chuyên môn tối thiểu giữa hai học phần để được xem là "học phần tương đương" là bao nhiêu?';
const graduationQuestion = "Số đợt xét tốt nghiệp đại học trong một năm theo Quy chế đào tạo 2025 được quy định là bao nhiêu đợt?";
const scholarshipQuestion = "Tiêu chuẩn xét Học bổng KKHT loại Khá (loại C) yêu cầu mức GPA và ĐRL tối thiểu là bao nhiêu?";

test("Dữ liệu: 200 câu Quy chế + 118 câu Pháp luật, không trùng khóa chuẩn hóa", () => {
    assert(Object.keys(answers).length === 318, "Sai số lượng câu hỏi");
    assert(answersByQuestion.size === 318, "Trùng câu hỏi sau chuẩn hóa");
    for (const [question, choices] of Object.entries(answers)) {
        assert(question.trim() && choices.length && choices.every((choice) => choice.trim()), "Câu hỏi hoặc đáp án rỗng");
    }
});
test("Chọn đúng các đáp án mới: 80%, 5 đợt và GPA/ĐRL có dấu ≥", () => {
    const first = mountQuestion(equivalentQuestion, ["50%", "60%", "70%", "80%"]);
    const second = mountQuestion(graduationQuestion, ["3 đợt", "4 đợt", "5 đợt"]);
    const third = mountQuestion(scholarshipQuestion, ["GPA > 2,5 và ĐRL > 65", "GPA ≥ 2,5 và ĐRL ≥ 65"]);
    const result = autoFillFormBasedOnQuestion();
    assert(first[3].checked && !first[2].checked && second[2].checked && third[1].checked, "Chọn sai đáp án mới");
    assert(result.filledQuestions === 3 && result.clickedOptions === 3, "Đếm sai số câu vừa điền");
});
test("Số thứ tự, dấu bắt buộc, Unicode tách dấu và khoảng trắng không ngắt", () => {
    const question = `103. ${equivalentQuestion} *`.normalize("NFD").replaceAll(" ", "\u00a0");
    const inputs = mountQuestion(question, ["70%", " 80%\u00a0"]);
    assert(autoFillFormBasedOnQuestion().filledQuestions === 1 && inputs[1].checked, "Không chuẩn hóa được tiêu đề");
});
test("Dấu nháy cong trong tiêu đề vẫn khớp", () => {
    const inputs = mountQuestion(equivalentQuestion.replaceAll('"học phần tương đương"', '“học phần tương đương”'), ["80%"]);
    autoFillFormBasedOnQuestion();
    assert(inputs[0].checked, "Không khớp dấu nháy cong");
});
test("Đáp án chứa cả dấu nháy đơn và kép không gây lỗi selector", () => {
    const question = "Câu kiểm tra dấu nháy?";
    const answer = 'Lựa chọn "đúng" và \'dấu nháy đơn\'';
    answersByQuestion.set(question, [answer]);
    try {
        const inputs = mountQuestion(question, ["Lựa chọn khác", answer]);
        assert(autoFillFormBasedOnQuestion().filledQuestions === 1 && inputs[1].checked, "Không chọn được đáp án có nháy");
    } finally { answersByQuestion.delete(question); }
});
test("Giới hạn đáp án trong từng câu, bỏ qua câu chưa biết", () => {
    const known = "Sinh viên là con đẻ hoặc con nuôi hợp pháp của Người có công với cách mạng được hưởng mức hỗ trợ miễn giảm học phí là bao nhiêu?";
    const first = mountQuestion(known, ["Miễn 100% học phí", "Giảm 50% học phí"]);
    const second = mountQuestion("Câu chưa có trong dữ liệu?", ["Miễn 100% học phí"]);
    const result = autoFillFormBasedOnQuestion();
    assert(first[0].checked && !second[0].checked && result.unmatchedQuestions === 1, "Chọn nhầm sang câu khác");
});
test("Chọn đầy đủ nhiều đáp án checkbox của bộ Pháp luật", () => {
    const question = "Theo Luật Giáo dục Đại học 2018, trách nhiệm nào sau đây là bắt buộc đối với sinh viên?";
    const inputs = mountQuestion(question, ["Tôn trọng giảng viên, cán bộ và các sinh viên khác", "Phương án khác", "Được cung cấp đầy đủ thông tin về chương trình đào tạo và quy chế học tập"], "checkbox");
    const result = autoFillFormBasedOnQuestion();
    assert(inputs[0].checked && inputs[2].checked && !inputs[1].checked && result.clickedOptions === 2, "Không giữ được xử lý nhiều đáp án");
});
test("Khớp theo nhãn khi value của input là mã lựa chọn", () => {
    const inputs = mountQuestion(equivalentQuestion, ["80%"]);
    inputs[0].value = "choice-id";
    assert(autoFillFormBasedOnQuestion().filledQuestions === 1 && inputs[0].checked, "Không khớp được nhãn");
});
test("Điền lại không đảo lựa chọn và không click lần hai", () => {
    const inputs = mountQuestion(equivalentQuestion, ["70%", "80%"]);
    let clicks = 0;
    inputs[1].addEventListener("click", () => clicks++);
    autoFillFormBasedOnQuestion();
    const result = autoFillFormBasedOnQuestion();
    assert(clicks === 1 && inputs[1].checked && result.filledQuestions === 0 && result.alreadyFilledQuestions === 1, "Điền lại làm thay đổi đáp án");
});
test("Đáp án không có hoặc bị khóa được tính là chưa khớp", () => {
    mountQuestion(equivalentQuestion, ["70%"]);
    const inputs = mountQuestion(graduationQuestion, ["5 đợt"]);
    inputs[0].disabled = true;
    const result = autoFillFormBasedOnQuestion();
    assert(result.filledQuestions === 0 && result.unmatchedQuestions === 2 && !inputs[0].checked, "Báo thành công với đáp án không khả dụng");
});
test("Giữ nguyên thông tin cá nhân và câu tự luận", () => {
    const item = document.createElement("div");
    item.dataset.automationId = "questionItem";
    item.innerHTML = '<input type="text" value="Họ tên sinh viên"><textarea>Câu tự luận tự nhập</textarea>';
    fixture.append(item);
    const result = autoFillFormBasedOnQuestion();
    assert(item.querySelector("input").value === "Họ tên sinh viên" && item.querySelector("textarea").value === "Câu tự luận tự nhập" && result.unmatchedQuestions === 0, "Đã sửa ô thông tin hoặc tự luận");
});
test("Popup nhận thống kê thực từ content script", () => {
    mountQuestion(equivalentQuestion, ["80%"]);
    document.getElementById("fillForm").click();
    assert(document.getElementById("fillStatus").textContent.includes("Đã điền 1 câu"), "Popup không hiển thị kết quả");
    assert(!document.getElementById("fillForm").disabled, "Nút không được mở lại");
});
test("Popup hướng dẫn tải lại trang khi không kết nối được content script", () => {
    const send = chrome.tabs.sendMessage;
    chrome.tabs.sendMessage = (_id, _message, callback) => {
        chrome.runtime.lastError = { message: "No receiving end" };
        callback();
        chrome.runtime.lastError = undefined;
    };
    try {
        document.getElementById("fillForm").click();
        assert(document.getElementById("fillStatus").textContent.includes("tải lại trang"), "Thiếu thông báo mất kết nối");
    } finally { chrome.tabs.sendMessage = send; }
});
test("Popup xử lý được phản hồi rỗng", () => {
    const send = chrome.tabs.sendMessage;
    chrome.tabs.sendMessage = (_id, _message, callback) => callback();
    try {
        document.getElementById("fillForm").click();
        assert(document.getElementById("fillStatus").textContent.includes("Không nhận được"), "Phản hồi rỗng gây lỗi");
    } finally { chrome.tabs.sendMessage = send; }
});
test("Popup xử lý được trường hợp không có tab hoạt động", () => {
    const query = chrome.tabs.query;
    chrome.tabs.query = (_query, callback) => callback([]);
    try {
        document.getElementById("fillForm").click();
        assert(document.getElementById("fillStatus").textContent.includes("Không tìm thấy tab"), "Thiếu thông báo tab");
    } finally { chrome.tabs.query = query; }
});

const failed = testResults.filter((result) => !result.passed);
const output = document.getElementById("results");
output.dataset.status = failed.length ? "failed" : "passed";
output.textContent = testResults.map((result) => `${result.passed ? "PASS" : "FAIL"} ${result.name}${result.error ? `: ${result.error}` : ""}`).join("\n") + `\n\n${testResults.length - failed.length}/${testResults.length} kiểm tra đạt.`;
