function toggleEditMode(answerId) {
  const viewMode = document.getElementById(`view-mode-${answerId}`);
  const editMode = document.getElementById(`edit-mode-${answerId}`);

  if (viewMode && editMode) {
    // Bootstrap এর d-none ক্লাস টগল করে হাইড এবং শো করানো হচ্ছে
    viewMode.classList.toggle("d-none");
    editMode.classList.toggle("d-none");
  }
}

function openReportModal(targetId, reportOnType) {
  // মডালের ভেতরের হিডেন ইনপুট ফিল্ডগুলো খুঁজে বের করা
  document.getElementById("reportTargetId").value = targetId;
  document.getElementById("reportOnType").value = reportOnType;

  // বুটস্ট্র্যাপ মডালটি স্ক্রিনে শো করানো
  const reportModal = new bootstrap.Modal(
    document.getElementById("reportItemModal"),
  );
  reportModal.show();
}

//vote
async function submitVote(questionId, answerId, voteType) {
  try {
    // 1. Send the POST request to your backend route
    const response = await fetch(
      `/question/${questionId}/answer/${answerId}/vote`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType: voteType }), // Matches 'voteType' extracted in your backend
      },
    );

    // 2. Handle Authentication errors (if your isLoggedIn middleware intercepts)
    if (response.status === 401) {
      alert("Please log in to cast your vote!");
      return;
    }

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.success) {
      // 3. Dynamically update text contents with response data
      document.getElementById(`vote-pct-${answerId}`).innerText =
        `${data.percentage}%`;
      document.getElementById(`vote-total-${answerId}`).innerText =
        data.totalVotes;

      // 4. Update button states/styles depending on what userVote is active
      const yesBtn = document.getElementById(`btn-yes-${answerId}`);
      const noBtn = document.getElementById(`btn-no-${answerId}`);

      if (data.userVote === "yes") {
        // Toggle Yes Active, Clear No
        yesBtn.classList.replace("btn-outline-success", "btn-success");
        noBtn.classList.replace("btn-danger", "btn-outline-danger");
      } else if (data.userVote === "no") {
        // Toggle No Active, Clear Yes
        noBtn.classList.replace("btn-outline-danger", "btn-danger");
        yesBtn.classList.replace("btn-success", "btn-outline-success");
      } else {
        // userVote is empty string '' (User un-toggled their vote entirely)
        yesBtn.classList.replace("btn-success", "btn-outline-success");
        noBtn.classList.replace("btn-danger", "btn-outline-danger");
      }
    } else {
      alert(data.message || "Could not save your vote.");
    }
  } catch (error) {
    console.error("Voting Error:", error);
    alert("Something went wrong while submitting your vote.");
  }
}

function changeMainImage(thumbnail) {
    const mainImg = document.getElementById("mainQuestionImage");
    const mainLink = document.getElementById("mainImageLink"); // লিঙ্কটি ট্র্যাক করার জন্য যুক্ত করা হয়েছে
    
    // ১. মেইন ইমেজের সোর্স পরিবর্তন করা
    mainImg.src = thumbnail.src;
    
    // ২. মেইন লিঙ্কের href প্রপার্টিও পরিবর্তন করা (এটিই আপনার কাঙ্ক্ষিত সমাধান)
    if (mainLink) {
      mainLink.href = thumbnail.src;
    }

    // ৩. আপনার কাস্টম থাম্বনেইল অ্যাক্টিভ বর্ডার টগল লজিক (হুবহু একই রাখা হয়েছে)
    const allThumbs = document.querySelectorAll(".thumbnail-wrapper");
    allThumbs.forEach((wrapper) => {
      wrapper.classList.remove("border-primary", "border-2");
    });
    thumbnail.parentElement.classList.add("border-primary", "border-2");
  }

  
function changeAnsPreview(thumbElement, answerId) {
  const clickedImgSrc = thumbElement.querySelector("img").src;

  // মেইন প্রিভিউ ছবি পরিবর্তন
  document.getElementById(`mainAnsImg-${answerId}`).src = clickedImgSrc;

  // ভিউ ফুল স্ক্রিন বাটনের লিঙ্ক পরিবর্তন
  document.getElementById(`viewFullBtn-${answerId}`).href = clickedImgSrc;

  // বর্ডার স্টাইল টগল
  const parentContainer = thumbElement.parentElement;
  const allWrappers = parentContainer.querySelectorAll("div");
  allWrappers.forEach((div) =>
    div.classList.remove("border-primary", "border-2"),
  );

  thumbElement.classList.add("border-primary", "border-2");
}

//max size validation
document
  .getElementById("fileUrl")
  .addEventListener("change", (e) => validateSize(e, 5));
document
  .getElementById("imageUrl")
  .addEventListener("change", (e) => validateSize(e, 15));

function validateSize(event, maxMB) {
  const maxBytes = maxMB * 1024 * 1024;
  const files = event.target.files;

  for (let file of files) {
    if (file.size > maxBytes) {
      alert(`"${file.name}" is too large! Maximum limit is ${maxMB} MB.`);
      event.target.value = "";
      break;
    }
  }
}
