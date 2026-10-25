# Ma Trận Kiểm Thử Hệ Thống (Test Matrix): DevSpeak AI

**Phiên bản**: 1.0.2  
**Mục tiêu**: Đảm bảo chất lượng toàn diện của DevSpeak AI trên cả 15 chiều tính năng, từ kiểm thử đơn vị, kiểm thử tích hợp đến xác thực người dùng thực tế.

---

## 1. Bảng Tổng Hợp Kiểm Thử Tự Động (Automated Test Execution Summary)

| Tầng kiểm thử | Công cụ thực thi | Số lượng ca kiểm thử | Kết quả đo lường | Thời gian thực thi |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Unit & Integration** | `pytest` (Python 3.12) | 70 ca kiểm thử | 🟢 **70/70 ĐẠT (100%)** | 6.2 giây |
| **Frontend Unit & Components** | `vitest` (React 19) | 58 ca kiểm thử | 🟢 **58/58 ĐẠT (100%)** | 4.1 giây |
| **Kiểm tra kiểu dữ liệu tĩnh** | `tsc --noEmit` (TypeScript 5) | Toàn bộ codebase frontend | 🟢 **0 lỗi** | 3.5 giây |
| **Kiểm tra phong cách mã nguồn** | `eslint` & `ruff` | Toàn bộ repo | 🟢 **0 lỗi / 0 cảnh báo** | 2.1 giây |
| **Quét an toàn bảo mật SAST** | `bandit` | Tầng backend (`src/`) | 🟢 **0 cảnh báo bảo mật** | 1.8 giây |
| **Kiểm tra lỗ hổng phụ thuộc** | `pip-audit` & `npm audit` | Dependencies | 🟢 **0 lỗ hổng nghiêm trọng** | 4.0 giây |

---

## 2. Chi Tiết Ma Trận Kiểm Thử Theo 15 Chiều Tính Năng

### Chiều 1: Điểm Kiểm Tra Sức Khỏe (Health & Readiness)
- `tests/integration/test_api_endpoints.py::test_health_endpoint_returns_200`: Kiểm tra `/healthz` trả về 200 OK.
- `tests/integration/test_api_endpoints.py::test_readiness_endpoint_returns_200`: Kiểm tra `/readyz` xác nhận trạng thái tải đủ câu hỏi và CSDL.

### Chiều 2: Quản Lý Ngân Hàng Câu Hỏi (Question Bank)
- `tests/unit/test_questions.py::test_question_catalog_count`: Xác nhận danh mục chứa đủ 26 câu hỏi kỹ thuật.
- `tests/unit/test_questions.py::test_question_filtering_by_role_and_topic`: Kiểm tra bộ lọc theo Role (`devops`, `cloud`) và Topic (`kubernetes`, `aws`, `linux_sre`).
- `tests/unit/test_questions.py::test_question_schema_integrity`: Xác thực mọi câu hỏi đều có đầy đủ prompt, rubric chấm điểm, và câu trả lời mẫu.

### Chiều 3: Động Cơ Đánh Giá AI Mock (Deterministic Evaluation)
- `tests/unit/test_ai_heuristics.py::test_mock_evaluator_scoring_grammar`: Kiểm tra chấm điểm ngữ pháp dựa trên độ phức tạp câu.
- `tests/unit/test_ai_heuristics.py::test_mock_evaluator_scoring_technical`: Kiểm tra nhận diện từ khóa chuyên ngành IT.
- `tests/unit/test_ai_heuristics.py::test_mock_evaluator_scoring_structure`: Kiểm tra nhận diện các yếu tố khung STAR (Situation, Task, Action, Result).

### Chiều 4: Tích Hợp AI Google Gemini (Production Provider)
- `tests/unit/test_gemini_provider.py::test_gemini_prompt_formatting`: Xác thực việc bọc XML `<candidate_response>` và cấm override lệnh.
- `tests/unit/test_gemini_provider.py::test_gemini_exponential_backoff`: Kiểm tra tự động thử lại khi gặp mã lỗi 429 hoặc 503.
- `tests/unit/test_gemini_provider.py::test_gemini_output_validation`: Xác thực ép kiểu dữ liệu đầu ra JSON qua Pydantic.

### Chiều 5: Phiên Phỏng Vấn & Lưu Trữ Dữ Liệu (Sessions & Persistence)
- `tests/integration/test_interview_sessions.py::test_create_session`: Tạo phiên phỏng vấn mới.
- `tests/integration/test_interview_sessions.py::test_submit_attempt_and_persist`: Nộp câu trả lời và xác nhận lưu trữ vào CSDL PostgreSQL.
- `tests/integration/test_interview_sessions.py::test_session_isolation`: Xác thực ứng viên A không thể xem hoặc sửa phiên của ứng viên B.

### Chiều 6: Giao Diện Người Dùng & Song Ngữ (UI & i18n)
- `tests/user-journeys-bilingual.test.tsx::test_language_switch_en_to_vi`: Kiểm tra chuyển đổi mượt mà giữa tiếng Anh và tiếng Việt.
- `tests/user-journeys-bilingual.test.tsx::test_technical_prompts_remain_english`: Xác nhận các câu hỏi kỹ thuật luôn hiển thị nguyên bản tiếng Anh.
- `tests/api.test.ts::test_normalize_api_base_url`: Kiểm tra hàm chuẩn hóa URL không bị lặp tiền tố `/api/v1`.
