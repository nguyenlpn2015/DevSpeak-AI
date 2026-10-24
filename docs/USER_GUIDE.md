# Sổ Tay Hướng Dẫn Sử Dụng DevSpeak AI (End-User Guide)

**Dành cho**: Ứng viên Kỹ sư Phần mềm (Software Engineers), Kỹ sư DevOps, SRE, Cloud, Platform & Chuyên viên IT Quốc tế  
**Phiên bản ứng dụng**: DevSpeak AI v0.1.0 (Bilingual English / Vietnamese)  
**Môi trường khả dụng**: Trình duyệt Web (Desktop, Tablet, Mobile) qua `http://localhost:3001`  

---

## Mục Lục

1. [Tổng quan sản phẩm & Yêu cầu tiên quyết](#1-tổng-quan-sản-phẩm--yêu-cầu-tiên-quyết)
2. [Cách truy cập ứng dụng](#2-cách-truy-cập-ứng-dụng)
3. [Đăng ký, Đăng nhập & Chế độ Khách (Guest Mode)](#3-đăng-ký-đăng-nhập--chế-độ-khách-guest-mode)
4. [Bảng điều khiển & Điều hướng giao diện (Dashboard & Navigation)](#4-bảng-điều-khiển--điều-hướng-giao-diện-dashboard--navigation)
5. [Tra cứu & Lọc ngân hàng câu hỏi (Question Bank)](#5-tra-cứu--lọc-ngân-hàng-câu-hỏi-question-bank)
6. [Quy trình thực hành trong phòng phỏng vấn (AI Interview Studio)](#6-quy-trình-thực-hành-trong-phòng-phỏng-vấn-ai-interview-studio)
7. [Gửi câu trả lời & Đọc báo cáo phản hồi AI (Feedback Report)](#7-gửi-câu-trả-lời--đọc-báo-cáo-phản-hồi-ai-feedback-report)
8. [Bộ công cụ hỗ trợ: Từ vựng kỹ thuật & Khung STAR](#8-bộ-công-cụ-hỗ-trợ-từ-vựng-kỹ-thuật--khung-star)
9. [Luyện phỏng vấn hội thoại qua Text (Multi-Turn AI Interviewer)](#9-luyện-phỏng-vấn-hội-thoại-qua-text-multi-turn-ai-interviewer)
10. [Luyện nói qua Micro (Voice Mode) & Giới hạn trình duyệt](#10-luyện-nói-qua-micro-voice-mode--giới-hạn-trình-duyệt)
11. [Theo dõi tiến độ, Điểm kinh nghiệm (XP) & Chuỗi ngày học (Streak)](#11-theo-dõi-tiến-độ-điểm-kinh-nghiệm-xp--chuỗi-ngày-học-streak)
12. [Chuyển đổi song ngữ Anh — Việt (Language Switcher)](#12-chuyển-đổi-song-ngữ-anh--việt-language-switcher)
13. [Xử lý sự cố thường gặp (Troubleshooting)](#13-xử-lý-sự-cố-thường-gặp-troubleshooting)
14. [Chính sách bảo mật dữ liệu & Vận hành Offline](#14-chính-sách-bảo-mật-dữ-liệu--vận-hành-offline)
15. [Câu hỏi thường gặp (FAQ)](#15-câu-hỏi-thường-gặp-faq)
16. [Các giới hạn hiện tại & Tính năng đang phát triển](#16-các-giới-hạn-hiện-tại--tính-năng-đang-phát-triển)

---

## 1. Tổng quan sản phẩm & Yêu cầu tiên quyết

### 1.1. Mục đích sản phẩm
**DevSpeak AI** là nền tảng huấn luyện phỏng vấn tiếng Anh kỹ thuật chuyên sâu dành cho kỹ sư IT Việt Nam chuẩn bị phỏng vấn tại các tập đoàn công nghệ đa quốc gia hoặc làm việc từ xa (Remote).

Ứng dụng giúp bạn giải quyết 3 rào cản lớn nhất:
- **Khoảng cách diễn đạt**: Hiểu sâu kỹ thuật nhưng lúng túng khi trình bày bằng tiếng Anh chuyên ngành.
- **Thiếu cấu trúc câu trả lời**: Trả lời lan man, thiếu dẫn chứng theo chuẩn mực quốc tế (STAR, Root-cause Troubleshooting).
- **Phản xạ xử lý tình huống**: Bị động trước các câu hỏi đào sâu (probing questions) về sự cố sản xuất (production outages) hay đánh đổi kiến trúc (architectural trade-offs).

### 1.2. Yêu cầu thiết bị & Trình duyệt
- **Thiết bị**: Máy tính để bàn (PC), Laptop, Tablet hoặc Smartphone có kết nối mạng nội bộ/Internet.
- **Trình duyệt khuyến nghị**:
  - **Google Chrome** (khuyên dùng tốt nhất cho tính năng Voice Micro).
  - **Microsoft Edge** (hỗ trợ hoàn chỉnh Web Speech API).
  - **Apple Safari** (hỗ trợ Voice và giao diện PWA).
  - *Lưu ý*: Trình duyệt Mozilla Firefox hiện chưa hỗ trợ Speech Recognition API chuẩn; trên Firefox bạn vẫn thực hành đầy đủ qua bàn phím.
- **Quyền hạn cần cấp**: Cho phép quyền truy cập **Microphone** khi muốn sử dụng tính năng luyện nói.

---

## 2. Cách truy cập ứng dụng

Khi hệ thống DevSpeak AI đã được khởi động trên máy trạm hoặc máy chủ nội bộ:

1. Mở trình duyệt web của bạn.
2. Truy cập vào địa chỉ chính thức của giao diện người dùng:
   ```text
   http://localhost:3001
   ```
3. Quan sát góc trên bên phải thanh **Header**:
   - Nếu xuất hiện viên thuốc màu xanh ngọc với chấm sáng nhấp nháy ghi **Connected** (hoặc **Đã kết nối**): Hệ thống backend FastAPI trên cổng `8000` đang hoạt động hoàn hảo.
   - Nếu xuất hiện viên thuốc màu hổ phách ghi **Offline** (hoặc **Mất kết nối**): Dịch vụ backend chưa sẵn sàng. Bạn có thể nhấp trực tiếp vào nút này để kích hoạt lệnh thăm dò lại (`Re-probe`).

> [!NOTE]
> Ứng dụng hỗ trợ giao diện đáp ứng (Responsive Design). Trên màn hình điện thoại (dưới 768px), thanh bên (Sidebar) sẽ tự động ẩn thành thanh trượt (Drawer) có thể mở qua nút menu 3 gạch ở góc trên bên trái.

---

## 3. Đăng ký, Đăng nhập & Chế độ Khách (Guest Mode)

DevSpeak AI hỗ trợ hai hình thức trải nghiệm: **Có tài khoản cá nhân** (khuyên dùng để tích lũy XP và chuỗi ngày học) và **Chế độ Khách (Guest Mode)**.

### 3.1. Đăng ký tài khoản mới (Sign Up)
1. Nhấp vào nút **Sign In** (hoặc **Đăng nhập**) màu tím ở góc trên bên phải thanh Header.
2. Trong hộp thoại hiển thị, nhấp vào tab **Create Account** (Tạo tài khoản).
3. Điền các trường thông tin:
   - **Email**: Nhập địa chỉ email hợp lệ của bạn (ví dụ: `candidate@example.com`).
   - **Password (Mật khẩu)**: Nhập tối thiểu **8 ký tự** (hỗ trợ tối đa 128 ký tự).
   - **Full Name (Họ và tên)**: Tên hiển thị của bạn (ví dụ: `Nguyen Van A`).
   - **Target Role (Vị trí mục tiêu)**: Chọn một trong các nhóm:
     - `DevOps & SRE Engineer`
     - `Cloud Architect`
     - `Backend Engineer`
     - `General IT Specialist`
   - **Target Level (Trình độ CEFR mong muốn)**:
     - `B1 - Intermediate` (Mức cơ bản)
     - `B2 - Upper Intermediate` (*Khuyến nghị chuẩn cho phỏng vấn quốc tế*)
     - `C1 - Advanced Professional` (Mức chuyên gia thành thạo)
4. Nhấp vào nút **Create Account**. Hệ thống sẽ tự động đăng nhập và cấp mã định danh an toàn.

### 3.2. Đăng nhập (Log In)
1. Nhấp vào nút **Sign In** trên Header.
2. Chọn tab **Sign In**.
3. Nhập **Email** và **Password**.
4. Nhấp nút **Sign In**. Sau khi đăng nhập thành công:
   - Avatar chữ cái đầu và tên tài khoản sẽ xuất hiện trên thanh Header.
   - Badge trình độ mục tiêu (ví dụ: `B2`) sẽ được hiển thị.
   - Điểm số và tiến độ thực hành từ cơ sở dữ liệu sẽ được đồng bộ ngay lập tức.

### 3.3. Đăng xuất (Log Out)
- Nhấp vào biểu tượng cửa thoát màu đỏ (**Log Out**) bên cạnh tên tài khoản của bạn trên thanh Header. Dữ liệu phiên được dọn dẹp an toàn trên trình duyệt.

### 3.4. Trải nghiệm không cần tài khoản (Chế độ Khách)
- Bạn không bắt buộc phải đăng nhập để trải nghiệm. Bạn có thể duyệt câu hỏi, xem rubric, tra cứu flashcards và làm bài tập ngay lập tức.
- *Lưu ý*: Ở chế độ khách, điểm kinh nghiệm (XP) và chuỗi ngày học sẽ chỉ lưu tạm thời trong phiên làm việc hiện tại của trình duyệt.

---

## 4. Bảng điều khiển & Điều hướng giao diện (Dashboard & Navigation)

Giao diện của DevSpeak AI áp dụng ngôn ngữ thiết kế **LinguaFlow** hiện đại với tông màu tối neon chuyên nghiệp, bao gồm 3 khu vực chính:

```
+-----------------------------------------------------------------------------------------+
| [Header] Logo DevSpeak AI | AI Studio Pill | Nav Tabs | Status (Connected) | Lang | User|
+---------------------+-------------------------------------------------------------------+
| [LinguaSidebar]     | [Main Content Area]                                               |
| - Day Streak & Level| - Banner Chào mừng & Cấp độ hiện tại                              |
| - Thanh tiến độ XP  | - 4 Thẻ chỉ số tổng quan (Streak, XP, Từ vựng, Trình độ)         |
|                     | - Biểu đồ rèn luyện theo tuần & Lịch chuỗi ngày                    |
| - Bảng điều khiển   | - Thẻ hành động nhanh: Review Cards, Shadow, Talk AI, Exercises   |
| - Ngân hàng câu hỏi | - Mục tiêu hôm nay & Huy hiệu thành tựu                          |
| - Thẻ ghi nhớ       |                                                                   |
| - Phòng phỏng vấn   |                                                                   |
| - Phương pháp STAR  |                                                                   |
+---------------------+-------------------------------------------------------------------+
| [Footer] Bản quyền © 2026 DevSpeak AI • Security-First • Zero Cost • Local-First        |
+-----------------------------------------------------------------------------------------+
```

### 4.1. Thanh điều hướng bên trái (LinguaSidebar)
- **Day Streak & Level**: Hiển thị số ngày bạn liên tục luyện tập và cấp độ mục tiêu.
- **Thanh tiến độ XP**: Thước đo trực quan thể hiện điểm kinh nghiệm đã đạt được trên tổng số 500 XP của mỗi cấp độ.
- **Danh mục chức năng (Learn Section)**:
  - **Dashboard**: Trở về màn hình tổng quan và thống kê năng lực.
  - **Question Bank**: Mở ngân hàng 26 câu hỏi phỏng vấn kỹ thuật phân loại theo chủ đề.
  - **Flashcards / Vocab Vault**: Mở không gian ôn tập từ vựng kỹ thuật 3D.
  - **Practice Studio / Shadowing**: Mở ngay phòng phỏng vấn trực tiếp cho câu hỏi đang chọn.
  - **STAR Method**: Mở kịch bản câu hỏi hành vi xử lý sự cố chuẩn hóa theo mô hình STAR.

### 4.2. Màn hình Dashboard Flagship
- **Thẻ chỉ số tổng hợp (Metric Cards)**:
  - `Day Streak`: Số ngày liên tục mở ứng dụng và nộp bài luyện tập.
  - `Total XP`: Điểm tích lũy (nhận 50 XP cho mỗi câu hỏi hoàn thành kèm điểm thưởng theo chất lượng câu trả lời).
  - `Words Learned`: Số lượng thuật ngữ và mẫu câu kỹ thuật bạn đã áp dụng thành công.
  - `Level`: Cấp độ hiện tại của bạn dựa trên tổng số XP.
- **Khu vực Tiếp tục học tập (Continue Learning)**:
  - *Review Cards*: Khởi động bộ thẻ nhớ từ vựng.
  - *Shadow Practice*: Luyện nói mô phỏng theo mẫu câu chuyên gia.
  - *Talk with AI*: Bắt đầu hội thoại hỏi đáp nhiều lượt với AI Interviewer.
  - *Do Exercises*: Thực hành ghép khung cấu trúc sự cố.

---

## 5. Tra cứu & Lọc ngân hàng câu hỏi (Question Bank)

Ngân hàng đề thi của DevSpeak AI bao gồm **26 kịch bản phỏng vấn kỹ thuật chuyên sâu**, được tuyển chọn bám sát thực tế tuyển dụng của các công ty công nghệ quốc tế.

### 5.1. Các nhóm chủ đề (Topics)
1. **Kubernetes Architecture & Diagnostics**: Sự cố `CrashLoopBackOff`, Ingress DNS routing, Giới hạn tài nguyên cgroup & `OOMKilled`, CNI NetworkPolicies.
2. **CI/CD & DevSecOps Pipelines**: Chiến lược điều phối Canary rollback, Tích hợp quét bảo mật SAST/DAST, GitOps với ArgoCD.
3. **Linux Internals & SRE Diagnostics**: Chẩn đoán tải cao `high iowait`, Phân tích cgroup memory saturation, Bắt gói tin sự cố mạng với `tcpdump`.
4. **AWS Cloud Infrastructure**: Tối ưu hóa chi phí truyền tải Multi-AZ, Thiết kế phân quyền đặc quyền tối thiểu IAM Least Privilege, So sánh Transit Gateway vs VPC Peering.
5. **Docker & Containerization**: Tối ưu bộ nhớ đệm đa tầng (Multi-stage build caching), Xây dựng container Distroless chạy dưới quyền Non-root user.
6. **System Design & Distributed Systems**: Thiết kế Rate Limiter phân tán, Idempotent webhook xử lý thanh toán, Khắc phục Database Replication Lag.
7. **STAR Behavioral & Engineering Leadership**: Báo cáo sự cố hệ thống nghiêm trọng (Production Outage Retrospective), Bất đồng quan điểm kỹ thuật với Principal Engineer, Kèm cặp kỹ sư mới.

### 5.2. Cách lọc và tìm kiếm câu hỏi
1. Nhấp vào tab **Question Bank** trên Header hoặc Sidebar.
2. Sử dụng 3 thanh lọc linh hoạt:
   - **Role (Vai trò)**: Chọn `All Roles`, `DevOps Engineer`, hoặc `Software Engineer`.
   - **Topic (Chủ đề)**: Chọn chủ đề kỹ thuật bạn muốn tập trung ôn luyện.
   - **Difficulty (Độ khó)**: Lọc theo cấp bậc `Junior`, `Mid-Level`, hoặc `Senior`.
3. Số lượng câu hỏi tương ứng với bộ lọc sẽ lập tức được cập nhật trên màn hình.

### 5.3. Xem chi tiết thông số câu hỏi (View Details)
- Trên mỗi thẻ câu hỏi, bấm nút **View Details**:
  - Xem toàn văn đề bài tiếng Anh chuẩn quốc tế.
  - Tra cứu các tiêu chí đánh giá cốt lõi (**Key Concepts**).
  - Khám phá các câu hỏi phụ mà nhà tuyển dụng thường hỏi đào sâu (**Follow-up Questions**).
  - Bấm **Practice in Studio** để nạp đề bài này vào phòng luyện tập.

---

## 6. Quy trình thực hành trong phòng phỏng vấn (AI Interview Studio)

Phòng phỏng vấn **AI Interview Studio** được thiết kế theo cấu trúc 3 khu vực (3-Zone Workspace) chuyên nghiệp:

```
+---------------------------------------------------------------------------------------------------+
| AI INTERVIEW STUDIO                                                                               |
+--------------------------+------------------------------------------+-----------------------------+
| CỘT 1: ĐIỀU HƯỚNG PHIÊN  | CỘT 2: KHÔNG GIAN SOẠN THẢO TRẢ LỜI      | CỘT 3: BẢNG TIÊU CHÍ RUBRIC |
| - Tiến độ câu hỏi        | - Đề bài & Tiêu chuẩn đánh giá           | - Từ khóa cốt lõi           |
| - Danh sách 26 câu hỏi   | - Phím bật Voice Micro [Click to Speak]  | - Mẹo STAR Framework        |
| - Nút Thoát (Exit)       | - Khung soạn thảo văn bản tiếng Anh      | - Xem câu trả lời mẫu       |
|                          | - Các chip trợ giúp STAR & Triage        |   [Study Model Answer]      |
|                          | - Nút Gửi bài [Submit Answer]            |                             |
+--------------------------+------------------------------------------+-----------------------------+
```

### Các bước thực hành từng bước:
1. **Đọc kỹ đề bài**: Đọc kỹ phần **Interview Scenario & Technical Prompt** ở khung giữa.
2. **Nghiên cứu gợi ý kỹ thuật**: Nhìn sang cột bên phải để xem các công nghệ trọng tâm cần nhắc tới (ví dụ: `kubectl describe pod`, `Exit Code 137`, `OOMKilled`).
3. **Soạn thảo câu trả lời**:
   - Gõ trực tiếp bằng tiếng Anh vào khung soạn thảo.
   - Hoặc bật Microphone để nói (xem mục 10).
4. **Kiểm tra độ dài**:
   - Bộ đếm ký tự thời gian thực sẽ hiển thị phía dưới khung soạn thảo.
   - Độ dài hợp lệ: Tối thiểu **10 ký tự** và không quá **4.000 ký tự**.
5. **Gửi bài đánh giá**:
   - Nhấp vào nút màu tím **Submit Answer**.
   - Hoặc bấm tổ hợp phím tắt: `Ctrl + Enter` (Windows/Linux) hoặc `Cmd + Enter` (macOS).

---

## 7. Gửi câu trả lời & Đọc báo cáo phản hồi AI (Feedback Report)

Ngay sau khi gửi bài, hệ thống AI sẽ phân tích câu trả lời của bạn qua 3 tiêu chuẩn khắt khe và xuất bản **Báo cáo đánh giá toàn diện**:

### 7.1. Bảng điểm 3 trụ cột (Scores Breakdown)
- **Technical Accuracy (Độ chính xác kỹ thuật — 1.0 đến 10.0)**: Kiểm tra bạn có nắm đúng bản chất cơ chế hoạt động, câu lệnh, công cụ và quy trình kỹ thuật hay không.
- **Grammar & Tone (Ngữ pháp & Văn phong chuyên nghiệp — 1.0 đến 10.0)**: Đánh giá độ chuẩn xác về thì, cấu trúc câu, cách sử dụng liên từ và phong thái tự tin của một kỹ sư quốc tế.
- **Clarity & Structure (Mạch lạc & Cấu trúc logic — 1.0 đến 10.0)**: Đo lường khả năng dẫn dắt luận điểm rõ ràng, có đầu có cuối.
- **Overall Score (Điểm tổng hợp)**: Phân tầng năng lực:
  - `Developing (< 6.0)`: Cần củng cố thêm từ vựng và cấu trúc.
  - `Solid (6.0 - 7.9)`: Đạt chuẩn phỏng vấn kỹ thuật cơ bản.
  - `Strong (8.0 - 10.0)`: Xuất sắc, sẵn sàng cho các vòng phỏng vấn cấp cao (Staff / Lead).

### 7.2. Các tab phân tích chi tiết
- **Technical Feedback (Góp ý chuyên môn)**: Liệt kê rõ những luận điểm bạn đã làm tốt và các kiến thức còn thiếu sót cần bổ sung.
- **Grammar Improvements (Sửa lỗi ngữ pháp & Cách diễn đạt)**: Gợi ý cách viết lại câu tiếng Anh của bạn theo giọng điệu tự nhiên của kỹ sư bản ngữ (Native Engineering Idioms).
- **Structure (Cấu trúc luận điểm)**: Hướng dẫn sắp xếp thứ tự các bước xử lý sự cố.
- **Benchmark Model Answer (Câu trả lời mẫu điểm 10)**: Mẫu câu trả lời hoàn chỉnh được biên soạn bởi chuyên gia. Bạn có thể bấm nút **Copy Answer** để sao chép vào bộ nhớ tạm.
- **Suggested Follow-up Questions**: 2 câu hỏi mở rộng giúp bạn lường trước những câu hỏi bẫy của nhà tuyển dụng.

---

## 8. Bộ công cụ hỗ trợ: Từ vựng kỹ thuật & Khung STAR

Để bạn không bao giờ rơi vào tình trạng "bí từ", Studio tích hợp sẵn các công cụ hỗ trợ tức thì:

### 8.1. Chèn từ vựng kỹ thuật 1 chạm (Vocabulary Coach)
- Trong cột **Rubric Cheat Sheet**, mỗi câu hỏi đều có danh sách các từ khóa then chốt (**Key Technical Concepts**).
- Bạn chỉ cần **nhấp chuột vào bất kỳ từ khóa nào** (ví dụ: `cgroup memory limits`), hệ thống sẽ tự động chèn từ khóa đó vào khung soạn thảo nháp của bạn và di chuyển con trỏ chuột về vị trí sẵn sàng.

### 8.2. Mẫu khung cấu trúc STAR (STAR Framework Chip)
- Khi phỏng vấn về các câu hỏi hành vi hoặc sự cố, nhấp vào nút **Insert STAR Template** phía trên khung soạn thảo.
- Khung sườn 4 phần sẽ tự động được điền:
  - `Situation`: Bối cảnh hệ thống và quy mô sự cố phát sinh.
  - `Task`: Mục tiêu và trách nhiệm trực tiếp của bạn trong SLA.
  - `Action`: Các hành động kỹ thuật bạn đã điều tra và khắc phục.
  - `Result`: Kết quả định lượng (giảm downtime, khôi phục dữ liệu 100%).
- Việc của bạn là chỉ cần thay đổi số liệu thực tế của dự án mình vào mẫu có sẵn.

### 8.3. Mẫu chẩn đoán sự cố (Troubleshooting Flow Chip)
- Bấm nút **Insert Troubleshooting Steps** để chèn ngay mẫu câu mở đầu chuẩn mực:
  > *"When diagnosing this issue in production, I take a structured chronological approach. First, I verify container and node events. Next, I inspect previous termination logs. Finally, I apply the targeted mitigation via our deployment manifest."*

### 8.4. Thẻ ghi nhớ từ vựng 3D (Flashcards Studio)
- Truy cập mục **Flashcards** trên thanh Sidebar:
  - Bấm vào thẻ để lật mặt sau xem giải nghĩa kỹ thuật và ví dụ ngữ cảnh.
  - Nhấp vào biểu tượng chiếc loa để nghe phát âm tiếng Anh chuẩn.
  - Bấm **Practice in Studio** trên thẻ để chuyển ngay sang câu hỏi phỏng vấn ứng dụng thuật ngữ đó.

---

## 9. Luyện phỏng vấn hội thoại qua Text (Multi-Turn AI Interviewer)

Thay vì chỉ chấm điểm một lần, DevSpeak AI cung cấp chế độ **Phỏng vấn hội thoại tương tác (Multi-Turn Interview Session)**:

1. Khi bạn bắt đầu một phiên phỏng vấn mới, AI Interviewer sẽ chào mừng bạn và đặt câu hỏi mở đầu (**Turn 0**).
2. Bạn nhập câu trả lời của mình (**Turn 1**):
   - AI ghi nhận phần trả lời.
   - Thay vì kết thúc, AI sẽ đóng vai người phỏng vấn khó tính và đặt một câu hỏi đào sâu: *"Good initial diagnosis. However, how would you ensure this doesn't impact other pods sharing the same node?"*
3. Bạn tiếp tục giải thích phương án dự phòng (**Turn 2**).
4. Đến lượt cuối cùng (**Turn 3**): AI sẽ tổng kết toàn bộ buổi phỏng vấn, đánh dấu phiên hoàn tất (`Completed`) và xuất bản bảng điểm toàn diện cho toàn bộ chuỗi hội thoại.

---

## 10. Luyện nói qua Micro (Voice Mode) & Giới hạn trình duyệt

### 10.1. Hướng dẫn sử dụng tính năng Voice Input
1. Trong phòng Studio, tìm nút **Click to Speak** (biểu tượng micro màu tím) nằm ngay phía trên góc phải khung trả lời.
2. Nhấp vào nút **Click to Speak**.
3. Nếu trình duyệt hiện hộp thoại hỏi *"devspeak muốn sử dụng micro của bạn"*, nhấp **Allow** (Cho phép).
4. Biểu tượng chuyển sang trạng thái nhấp nháy đỏ kèm nhãn **Listening...**: Hãy bắt đầu trả lời bằng tiếng Anh rõ ràng với tốc độ vừa phải.
5. Khi bạn nói, văn bản tiếng Anh sẽ tự động được phiên âm và hiển thị theo thời gian thực.
6. Sau khi nói xong, nhấp nút **Stop Recording**. Toàn bộ văn bản sẽ được tự động chèn vào khung nháp để bạn có thể đọc lại, sửa chính tả trước khi bấm **Submit Answer**.

### 10.2. Giới hạn & Lưu ý quan trọng
- **Yêu cầu bảo mật trình duyệt**: Trình duyệt chỉ cho phép truy cập micro khi chạy trên kết nối bảo mật (`https://`) hoặc máy cục bộ (`http://localhost`).
- **Trình duyệt tương thích**: Tính năng hoạt động mượt mà trên Chrome, Edge và Safari. Trên trình duyệt Firefox, nút Voice sẽ hiển thị thông báo trình duyệt chưa hỗ trợ Web Speech API; bạn hãy dùng bàn phím để nhập liệu.
- **Tiếng ồn môi trường**: Nên sử dụng tai nghe có micro để hệ thống nhận diện từ vựng kỹ thuật chính xác nhất.

---

## 11. Theo dõi tiến độ, Điểm kinh nghiệm (XP) & Chuỗi ngày học (Streak)

Khi bạn đăng nhập tài khoản:
- **Tích lũy Điểm kinh nghiệm (Total XP)**:
  - Mỗi câu trả lời được nộp và đánh giá thành công: **+50 XP cơ bản**.
  - Đạt điểm Overall Score $\ge 8.0$: **+25 XP thưởng thành tích**.
  - Hoàn tất trọn vẹn 3 lượt phỏng vấn hội thoại: **+30 XP hoàn thành phiên**.
- **Thăng hạng Cấp độ (Level Up)**:
  - Cứ mỗi 500 XP tích lũy, bạn sẽ thăng lên một cấp độ mới (Level 1 $\to$ Level 2 $\to$ Level 3...).
- **Chuỗi ngày học liên tục (Day Streak)**:
  - Hệ thống tự động ghi nhận chuỗi ngày bạn vào thực hành. Duy trì thói quen mỗi ngày ít nhất một câu hỏi để không bị gián đoạn chuỗi streak.

---

## 12. Chuyển đổi song ngữ Anh — Việt (Language Switcher)

DevSpeak AI là ứng dụng được thiết kế song ngữ hoàn chỉnh:

- Nhấp vào nút **EN / VI** trên thanh Header (góc trên bên phải):
  - Chuyển sang **VI**: Toàn bộ giao diện bảng điều khiển, hướng dẫn làm bài, thanh điều hướng và nhãn nút bấm sẽ hiển thị bằng tiếng Việt thân thuộc.
  - Chuyển sang **EN**: Giao diện hiển thị 100% bằng tiếng Anh quốc tế.
- **Nguyên tắc bảo tồn tiếng Anh kỹ thuật**: Các câu hỏi phỏng vấn, rubric đánh giá, câu hỏi đào sâu và câu trả lời mẫu luôn được giữ nguyên văn bằng tiếng Anh để đảm bảo bạn được cọ xát với môi trường phỏng vấn thực tế.
- Tùy chọn ngôn ngữ của bạn được lưu tự động trong bộ nhớ trình duyệt (`localStorage`) và được giữ nguyên cho các lần truy cập sau.

---

## 13. Xử lý sự cố thường gặp (Troubleshooting)

### Sự cố 1: Nút trạng thái Header báo màu hổ phách "Offline"
- **Nguyên nhân**: Frontend không kết nối được tới API FastAPI trên cổng `8000`.
- **Cách khắc phục**:
  1. Nhấp trực tiếp vào viên thuốc trạng thái **Offline** để kích hoạt thăm dò lại.
  2. Kiểm tra xem Docker container `devspeak-api` có đang chạy hay không bằng lệnh: `docker compose ps`.
  3. Đảm bảo cổng `8000` không bị chặn bởi tường lửa hoặc phần mềm diệt virus.

### Sự cố 2: Nút Micro báo "Speech recognition is not supported in this browser"
- **Nguyên nhân**: Trình duyệt bạn đang dùng (ví dụ: Firefox) không tích hợp sẵn Web Speech API.
- **Cách khắc phục**: Chuyển sang sử dụng trình duyệt Google Chrome hoặc Microsoft Edge để tận hưởng tính năng thu âm nhận diện giọng nói.

### Sự cố 3: Nút Micro không ghi âm được / Lỗi từ chối quyền Micro
- **Nguyên nhân**: Quyền truy cập Microphone đã bị chặn trong cài đặt trang web.
- **Cách khắc phục**:
  1. Nhấp vào biểu tượng **Ổ khóa** (hoặc biểu tượng Tune) ở góc bên trái thanh địa chỉ URL trình duyệt.
  2. Tại mục **Microphone**, chuyển từ *Block* sang **Allow**.
  3. Tải lại trang (`F5`) và bấm lại vào nút **Click to Speak**.

### Sự cố 4: Nút Submit Answer bị mờ (Disabled) không bấm được
- **Nguyên nhân**: Câu trả lời của bạn quá ngắn (dưới 10 ký tự) hoặc quá dài (vượt quá 4.000 ký tự).
- **Cách khắc phục**: Kiểm tra bộ đếm ký tự phía dưới ô nhập. Hãy bổ sung thêm chi tiết kỹ thuật để câu trả lời đạt tối thiểu 10 ký tự.

---

## 14. Chính sách bảo mật dữ liệu & Vận hành Offline

DevSpeak AI được xây dựng theo triết lý **Security-First** và **Local-First**:
- **Bảo mật mật khẩu tuyệt đối**: Mật khẩu tài khoản của bạn được mã hóa một chiều bằng thuật toán băm bộ nhớ cao cấp nhất hiện nay là **Argon2id**. Hệ thống không bao giờ lưu trữ hoặc in mật khẩu dưới dạng văn bản thô.
- **Cô lập dữ liệu phiên**: Dữ liệu phiên phỏng vấn và điểm số của bạn được liên kết chặt chẽ với tài khoản định danh qua mã JWT.
- **Vận hành Offline / 0-Cost**: Hệ thống tích hợp sẵn bộ máy chấm điểm **Offline Mock Provider**. Bạn hoàn toàn có thể luyện tập không giới hạn mà không cần nạp tiền, không cần thẻ tín dụng và không lo rò rỉ dữ liệu lên các máy chủ công cộng.
- **Khi sử dụng Google Gemini**: Nếu bạn cấu hình khóa API Gemini của riêng mình, chỉ có nội dung câu hỏi và câu trả lời của bạn được gửi đi để phân tích ngôn ngữ; thông tin tài khoản và mật khẩu của bạn tuyệt đối không bao giờ được gửi tới bên thứ ba.

---

## 15. Câu hỏi thường gặp (FAQ)

**Q1: Tôi có thể sử dụng DevSpeak AI hoàn toàn miễn phí không?**  
*Trả lời*: Hoàn toàn miễn phí! Ứng dụng chạy trên máy cá nhân của bạn với Mock AI Provider tích hợp sẵn mà không tốn bất kỳ chi phí nào.

**Q2: Hệ thống có chấm điểm phát âm tiếng Anh từng âm tiết không?**  
*Trả lời*: Phiên bản hiện tại tập trung vào nhận diện giọng nói thành văn bản để đánh giá tính chính xác về kỹ thuật, ngữ pháp và cấu trúc câu trả lời. Tính năng phân tích ngữ âm chi tiết (Phonetic scoring) được lên kế hoạch trong các phiên bản tương lai.

**Q3: Tôi có thể tự thêm câu hỏi phỏng vấn của riêng mình vào hệ thống không?**  
*Trả lời*: Hiện tại hệ thống đi kèm 26 câu hỏi tiêu chuẩn được định nghĩa sẵn. Tính năng cho phép ứng viên tự tạo câu hỏi tùy chỉnh thông qua giao diện đang được đội ngũ phát triển xây dựng.

**Q4: Điểm số Overall Score được tính toán như thế nào?**  
*Trả lời*: Điểm tổng hợp được tính theo trọng số: $50\%$ Độ chính xác kỹ thuật (Technical Accuracy) + $30\%$ Cấu trúc mạch lạc (STAR / Clarity) + $20\%$ Ngữ pháp & Văn phong tiếng Anh (Grammar & Tone).

---

## 16. Các giới hạn hiện tại & Tính năng đang phát triển

Với tinh thần minh bạch kỹ thuật, tài liệu này xác nhận rõ các điểm còn giới hạn của phiên bản hiện tại:

1. **Bảng lịch sử phỏng vấn chi tiết (Session History UI)**:
   - Cơ sở dữ liệu PostgreSQL đã lưu trữ đầy đủ toàn bộ lịch sử các lần nộp bài (`interview_attempts`) và tin nhắn hội thoại (`interview_messages`).
   - Các chỉ số tổng quát (Tổng số câu hoàn thành, Streak, XP) đã được hiển thị trên Dashboard. Tuy nhiên, màn hình giao diện chuyên biệt dạng bảng để xem lại từng bài nộp cũ trong quá khứ đang được hoàn thiện ở cột mốc tiếp theo.
2. **Nhận diện giọng nói trên Firefox**:
   - Do giới hạn kiến trúc của trình duyệt Firefox, người dùng Firefox được khuyến nghị gõ văn bản hoặc chuyển sang Chrome/Edge để dùng Micro.
3. **Mã sửa lỗi bảo mật đang chờ cập nhật (Defect SEC-01)**:
   - Đội ngũ bảo mật đã phát hiện và ghi nhận lỗ hổng kiểm tra quyền đối với các phiên phỏng vấn ở chế độ ẩn danh trong tài liệu [DEFECT_BACKLOG.md](file:///d:/DEVSPEAK-AI/docs/DEFECT_BACKLOG.md). Bản vá bảo mật đang được triển khai.
