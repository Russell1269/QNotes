function requestAiSolution() {
  const promptInput = document.getElementById("aiInputPrompt");
  const chatBody = document.getElementById("aiChatBody");
  const submitBtn = document.getElementById("aiSubmitBtn");
  
  const questionText = promptInput.value.trim();
  if (!questionText) return;
  
  // ১. ইউজারের টেক্সট চ্যাটবক্সে পুশ করা
  chatBody.innerHTML += `
    <div class="bg-danger bg-opacity-10 p-2 rounded mb-2 text-end text-dark ms-auto" style="max-width: 85%; width: fit-content;">
      ${questionText}
    </div>
  `;
  
  // লোডিং ইন্ডিকেটর শো করা
  const loadingId = "loader-" + Date.now();
  chatBody.innerHTML += `
    <div id="${loadingId}" class="bg-white p-2 rounded shadow-sm border mb-2 text-secondary">
      <span class="spinner-border spinner-border-sm text-danger me-1"></span> Thinking...
    </div>
  `;
  
  promptInput.value = ""; // ইনপুট ক্লিয়ার
  chatBody.scrollTop = chatBody.scrollHeight; // স্ক্রোল নিচে নামানো
  
  // ইনপুট এবং বাটন ডিজেবল করা প্রোসেসিং চলাকালীন
  promptInput.disabled = true;
  submitBtn.disabled = true;

  // ২. আপনার তৈরি করা এক্সপ্রেস এআই রুটে Fetch রিকোয়েস্ট পাঠানো
  fetch("/ai/ai-solve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: questionText })
  })
  .then(res => {
    // লগইন চেক হ্যান্ডেল করা
    if (res.redirected && res.url.includes('/login')) {
      alert("Please login first to chat with AI!");
      window.location.href = '/login';
      return;
    }
    return res.json();
  })
  .then(data => {
    // লোডিং ইন্ডিকেটরটি মুছে ফেলা
    const loader = document.getElementById(loadingId);
    if (loader) loader.remove();
    
    if (data && data.success) {
      // ৩. এআই এর আসল উত্তর চ্যাটবক্সে রেন্ডার করা (white-space লাইনের ব্রেকিং প্রিজার্ভ করার জন্য)
      chatBody.innerHTML += `
        <div class="bg-white p-2 rounded shadow-sm border mb-2 text-dark" style="white-space: pre-line; line-height: 1.5;">
          ${data.answer}
        </div>
      `;
    } else {
      chatBody.innerHTML += `<div class="bg-warning bg-opacity-10 p-2 rounded mb-2 text-danger">Error: ${data.message}</div>`;
    }
    
    // ইনপুট রিলিজ করা
    promptInput.disabled = false;
    submitBtn.disabled = false;
    chatBody.scrollTop = chatBody.scrollHeight;
  })
  .catch(err => {
    console.error("AI Client Fail:", err);
    const loader = document.getElementById(loadingId);
    if (loader) loader.remove();
    promptInput.disabled = false;
    submitBtn.disabled = false;
  });
}

// এন্টার বাটন চাপলে যাতে অটোমেটিক চ্যাট সাবমিট হয় তার লিসেনার
document.getElementById("aiInputPrompt")?.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    requestAiSolution();
  }
});
