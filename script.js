/**
 * TRÀ MỘC LÀNH - LANDING PAGE LOGIC
 * Includes: Countdown, Gallery, Modal Lightbox, Combo Selection, Form Validations, Google Sheet Integration.
 */

// --- CONFIGURATION ---
// Thay thế URL này bằng URL Web App của Google Apps Script sau khi bạn deploy script nhận đơn.
const GOOGLE_SHEET_SCRIPT_URL = ""; 

document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initGallery();
  initCertLightbox();
  initComboSelector();
  initFormSubmission();
  initFomoToasts();
  initGiftProgress();
});

/* ==========================================================================
   1. COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  // Thiết lập countdown đếm ngược 24h và tự động reset khi hết giờ
  let targetTime = localStorage.getItem("moc_lanh_countdown_target");

  if (!targetTime || new Date().getTime() > parseInt(targetTime)) {
    // Nếu chưa có hoặc đã hết hạn, tạo mục tiêu mới cách hiện tại 23 giờ 59 phút 59 giây
    const newTarget = new Date().getTime() + (23 * 60 * 60 + 59 * 60 + 59) * 1000;
    localStorage.setItem("moc_lanh_countdown_target", newTarget.toString());
    targetTime = newTarget;
  } else {
    targetTime = parseInt(targetTime);
  }

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance < 0) {
      // Hết giờ -> reset lại 24h mới
      const newTarget = new Date().getTime() + (23 * 60 * 60 + 59 * 60 + 59) * 1000;
      localStorage.setItem("moc_lanh_countdown_target", newTarget.toString());
      targetTime = newTarget;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   2. FEEDBACK GALLERY SLIDESHOW
   ========================================================================== */
function initGallery() {
  const track = document.getElementById("gallery-track");
  const slides = Array.from(track.children);
  const prevBtn = document.getElementById("gallery-prev-btn");
  const nextBtn = document.getElementById("gallery-next-btn");
  const dotsContainer = document.getElementById("gallery-dots");
  
  let currentIndex = 0;
  const slideCount = slides.length;
  let autoPlayTimer;

  // Tạo các chấm tròn chỉ số (dots)
  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.setAttribute("data-index", index);
    dot.setAttribute("id", `gallery-dot-${index}`);
    dotsContainer.appendChild(dot);
    
    dot.addEventListener("click", () => {
      goToSlide(index);
      resetAutoPlay();
    });
  });

  const dots = Array.from(dotsContainer.children);

  function updateSlidePosition() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Cập nhật dots active
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = (index + slideCount) % slideCount;
    updateSlidePosition();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetAutoPlay();
  });

  // Tự động chuyển slide sau mỗi 4 giây
  function startAutoPlay() {
    autoPlayTimer = setInterval(nextSlide, 4000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  startAutoPlay();
}

/* ==========================================================================
   3. CERTIFICATE LIGHTBOX POPUP
   ========================================================================== */
function initCertLightbox() {
  const certWrapper = document.getElementById("cert-wrapper");
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const closeBtn = document.getElementById("modal-close-btn");
  const backdrop = document.getElementById("modal-close-backdrop");

  function openModal() {
    const imgSrc = certWrapper.querySelector("img").src;
    modalImg.src = imgSrc;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // khóa cuộn màn hình nền
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // mở lại cuộn màn hình
  }

  certWrapper.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
}

/* ==========================================================================
   4. COMBO SELECTOR & SMOOTH SCROLL
   ========================================================================== */
function initComboSelector() {
  const selectButtons = document.querySelectorAll(".select-combo-btn");
  
  // Áp xạ từ mã combo của nút bấm sang ID của radio option tương ứng trong form
  const comboMapping = {
    "1_hop": "radio-1-hop",
    "2_hop": "radio-2-hop",
    "3_hop": "radio-3-hop",
    "4_hop_tang_2": "radio-4-hop",
    "5_hop_tang_3": "radio-5-hop"
  };

  selectButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const comboKey = btn.getAttribute("data-combo");
      const radioId = comboMapping[comboKey];
      
      if (radioId) {
        const radioInput = document.getElementById(radioId);
        if (radioInput) {
          radioInput.checked = true;
        }
      }

      // Cuộn mượt xuống khu vực Form Đặt Hàng
      const formSection = document.getElementById("form-dat-hang");
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ==========================================================================
   5. FORM VALIDATIONS & GOOGLE SHEETS INTEGRATION
   ========================================================================== */
function initFormSubmission() {
  const consultForm = document.getElementById("consult-form");
  const orderForm = document.getElementById("order-form");
  const successModal = document.getElementById("success-modal");
  const successCloseBtn = document.getElementById("success-close-btn");
  const successBackdrop = document.getElementById("success-close-backdrop");

  // Quy tắc xác thực số điện thoại di động Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)
  const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;

  function validateFormFields(name, phone) {
    if (name.trim().length < 2) {
      alert("Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).");
      return false;
    }
    if (!vnPhoneRegex.test(phone.trim())) {
      alert("Vui lòng nhập đúng định dạng số điện thoại di động Việt Nam (ví dụ: 0931899711).");
      return false;
    }
    return true;
  }

  function showSuccess() {
    successModal.classList.add("active");
    successModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeSuccess() {
    successModal.classList.remove("active");
    successModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  successCloseBtn.addEventListener("click", closeSuccess);
  successBackdrop.addEventListener("click", closeSuccess);

  // Xử lý gửi biểu mẫu
  function handleFormSubmit(e, formType) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.textContent;

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    // Thêm các siêu dữ liệu bổ sung
    data["form_type"] = formType;
    data["timestamp"] = new Date().toLocaleString("vi-VN");

    // Xác thực
    if (!validateFormFields(data.name, data.phone)) {
      return;
    }

    // Hiển thị trạng thái Loading
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi thông tin...";

    if (!GOOGLE_SHEET_SCRIPT_URL) {
      // NẾU CHƯA CÓ URL API GOOGLE SHEET: Giả lập gửi thành công sau 1 giây
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        form.reset();
        showSuccess();
      }, 1000);
    } else {
      // NẾU ĐÃ CÓ URL API GOOGLE SHEET: Gửi POST dạng x-www-form-urlencoded hoặc JSON
      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Thường Google Apps Script dùng chế độ no-cors để tránh lỗi CORS
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(data).toString()
      })
      .then(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        form.reset();
        showSuccess();
      })
      .catch((error) => {
        console.error("Lỗi khi gửi đơn hàng:", error);
        alert("Có lỗi xảy ra khi gửi dữ liệu. Vui lòng liên hệ hotline 0931.899.711 để đặt trực tiếp!");
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      });
    }
  }

  const heroOrderForm = document.getElementById("hero-order-form");

  if (consultForm) {
    consultForm.addEventListener("submit", (e) => handleFormSubmit(e, "Tư vấn miễn phí"));
  }

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => handleFormSubmit(e, "Đặt hàng combo"));
  }

  if (heroOrderForm) {
    heroOrderForm.addEventListener("submit", (e) => handleFormSubmit(e, "Đặt hàng nhanh Hero"));
  }
}

/* ==========================================================================
   FOMO PURCHASE TOAST NOTIFICATIONS
   ========================================================================== */
function initFomoToasts() {
  const toast = document.getElementById("fomo-toast");
  if (!toast) return;

  const names = [
    "Cô Hoa", "Chú Minh", "Cô Tuyết Nhung", "Chú Hùng", "Cô Lan Hương", 
    "Chú Nam", "Cô Vũ Hương", "Chú Sơn", "Cô Mai", "Chú Thanh"
  ];
  const cities = [
    "Hà Nội", "Ninh Bình", "Nam Định", "Hải Phòng", "Thanh Hóa", 
    "Đà Nẵng", "TP. Hồ Chí Minh", "Bình Dương", "Nghệ An", "Thái Bình"
  ];
  const combos = [
    "Combo 3 Hộp + Tặng Cốc Pha Trà",
    "Combo 2 Hộp (Dùng thử 1 tháng)",
    "Combo 4 Hộp (Tặng thêm 2 Hộp)",
    "Combo 5 Hộp (Tặng thêm 3 Hộp)"
  ];
  const minutes = [1, 2, 3, 4, 5, 6, 10];

  function showRandomPurchase() {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomCombo = combos[Math.floor(Math.random() * combos.length)];
    const randomMin = minutes[Math.floor(Math.random() * minutes.length)];

    toast.querySelector(".fomo-toast-title").textContent = `${randomName} (${randomCity})`;
    toast.querySelector(".fomo-toast-desc").textContent = `Vừa đặt mua ${randomCombo} ${randomMin} phút trước`;

    toast.classList.add("active");

    // Hide after 5 seconds
    setTimeout(() => {
      toast.classList.remove("active");
    }, 5000);
  }

  // Show first toast after 4 seconds
  setTimeout(showRandomPurchase, 4000);

  // Repeat every 18 seconds
  setInterval(showRandomPurchase, 18000);
}

/* ==========================================================================
   GIFT PROGRESS BAR TICKER
   ========================================================================== */
function initGiftProgress() {
  const fill = document.querySelector(".gift-progress-fill");
  const countText = document.querySelector(".gift-count");
  const percentText = document.querySelector(".gift-percentage");
  if (!fill || !countText) return;

  let count = parseInt(localStorage.getItem("moc_lanh_gift_count") || "7");
  
  function updateBar() {
    countText.textContent = count;
    const percentage = count * 10;
    if (percentText) percentText.textContent = `${percentage}%`;
    fill.style.width = `${percentage}%`;
  }

  updateBar();

  // Tick down randomly over time
  function tickDown() {
    if (count > 2) {
      count -= 1;
      localStorage.setItem("moc_lanh_gift_count", count);
      updateBar();
    }
  }

  // Tick down after a random delay (between 25s and 65s)
  setTimeout(function run() {
    tickDown();
    setTimeout(run, Math.random() * 40000 + 25000);
  }, Math.random() * 40000 + 25000);
}
