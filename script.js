/* ==========================================
   조윤정 포트폴리오 메인 스크립트 (script.js)
   기능: 모션 그래픽스 캔버스, 스크롤 인터랙션, 프로필 카드 조작, 
         스탯 애니메이션, 모의 채팅 인터랙션, 콘페티 이펙트
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------
     1. 모션 그래픽스 백그라운드 캔버스
     ------------------------------------------ */
  const canvas = document.getElementById('motion-canvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = Math.min(120, Math.floor((width * height) / 10000));
  const mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  let angle = 0;

  // 3D 큐브 기하학을 위한 버텍스 데이터
  const cubeVertices = [
    {x: -1, y: -1, z: -1},
    {x: 1, y: -1, z: -1},
    {x: 1, y: 1, z: -1},
    {x: -1, y: 1, z: -1},
    {x: -1, y: -1, z: 1},
    {x: 1, y: -1, z: 1},
    {x: 1, y: 1, z: 1},
    {x: -1, y: 1, z: 1}
  ];

  const cubeEdges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // 뒤쪽 면
    [4, 5], [5, 6], [6, 7], [7, 4], // 앞쪽 면
    [0, 4], [1, 5], [2, 6], [3, 7]  // 연결선
  ];

  let cubeAngleX = 0;
  let cubeAngleY = 0;

  class FloatingGeometry {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 8 + 4;
      this.type = Math.floor(Math.random() * 3); // 0: +, 1: square, 2: triangle
      this.speed = Math.random() * 0.12 + 0.04;
      this.angle = Math.random() * Math.PI * 2;
      this.rotSpeed = Math.random() * 0.008 - 0.004;
      this.opacity = Math.random() * 0.12 + 0.04; // 아주 은은한 농도
    }

    update() {
      this.y -= this.speed;
      this.angle += this.rotSpeed;
      if (this.y < -this.size) {
        this.y = height + this.size;
        this.x = Math.random() * width;
      }
    }

    draw() {
      ctx.save();
      ctx.strokeStyle = `rgba(83, 92, 104, ${this.opacity})`;
      ctx.lineWidth = 1;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.beginPath();
      if (this.type === 0) {
        // Cross (+)
        ctx.moveTo(-this.size / 2, 0);
        ctx.lineTo(this.size / 2, 0);
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(0, this.size / 2);
      } else if (this.type === 1) {
        // Square
        ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
      } else {
        // Triangle
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // 기하학 부유 요소 배열 채우기
  for (let i = 0; i < 30; i++) {
    particles.push(new FloatingGeometry());
  }

  function draw3DCube(cx, cy, size) {
    ctx.strokeStyle = 'rgba(45, 52, 54, 0.035)';
    ctx.lineWidth = 1;

    cubeAngleX += 0.0006;
    cubeAngleY += 0.0009;

    const projected = cubeVertices.map(v => {
      // X축 회전
      let y1 = v.y * Math.cos(cubeAngleX) - v.z * Math.sin(cubeAngleX);
      let z1 = v.y * Math.sin(cubeAngleX) + v.z * Math.cos(cubeAngleX);
      
      // Y축 회전
      let x2 = v.x * Math.cos(cubeAngleY) + z1 * Math.sin(cubeAngleY);
      let z2 = -v.x * Math.sin(cubeAngleY) + z1 * Math.cos(cubeAngleY);

      // 3D -> 2D 투영
      const distance = 2.5;
      const fov = 350;
      const scale = fov / (distance + z2);
      
      return {
        x: cx + x2 * size * (scale / 300),
        y: cy + y1 * size * (scale / 300)
      };
    });

    ctx.beginPath();
    cubeEdges.forEach(edge => {
      const p1 = projected[edge[0]];
      const p2 = projected[edge[1]];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    });
    ctx.stroke();
  }

  function drawBlueprint() {
    ctx.strokeStyle = 'rgba(45, 52, 54, 0.05)';
    ctx.lineWidth = 1;

    const cx = width / 2;
    const cy = height / 2;

    // 1. 메인 중심 십자 가이드선 (축선)
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // 2. 대형 동심원들 (Blueprint 원)
    const baseRadius = Math.min(width, height);
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.22, 0, Math.PI * 2);
    ctx.arc(cx, cy, baseRadius * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. 3D 회전 큐브 (기하학 핵심 연출)
    draw3DCube(cx, cy, baseRadius * 0.28);

    // 4. 서서히 회전하는 천체 기하학 격자선 (선과 면 강조)
    angle += 0.0003;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    
    // 회전 사선
    ctx.moveTo(-width, -height);
    ctx.lineTo(width, height);
    ctx.moveTo(-width, height);
    ctx.lineTo(width, -height);

    // 회전 삼각형 및 사각형 경계 프레임
    const side = baseRadius * 0.18;
    ctx.rect(-side, -side, side * 2, side * 2);
    ctx.moveTo(0, -side * 1.5);
    ctx.lineTo(side * 1.3, side * 0.8);
    ctx.lineTo(-side * 1.3, side * 0.8);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 5. 레퍼런스 이미지(ref1, ref2) 스타일의 좌표 정보 텍스트 데코레이션
    ctx.fillStyle = 'rgba(111, 128, 149, 0.25)';
    ctx.font = '9px Fira Code, monospace';
    ctx.fillText('● REVERSE', cx - baseRadius * 0.4, cy - baseRadius * 0.38);
    ctx.fillText('VOYAGER 1 [01.8]', cx + baseRadius * 0.2, cy - baseRadius * 0.2);
    ctx.fillText('VOYAGER 2 [21.8]', cx - baseRadius * 0.35, cy + baseRadius * 0.28);
    ctx.fillText('DEC 18, 1977', cx - baseRadius * 0.15, cy + baseRadius * 0.34);
    ctx.fillText('02:31:12 AM', cx + baseRadius * 0.12, cy + baseRadius * 0.34);
    ctx.fillText('SYSTEM_MAP: ACTIVE', 40, height - 40);

    // 6. 마우스 위치에 반응하는 대화형 좌표계선 (Coordinate Crosshair)
    if (mouse.x !== null && mouse.y !== null) {
      ctx.strokeStyle = 'rgba(45, 52, 54, 0.12)';
      ctx.lineWidth = 1;

      // 마우스 추적 십자선
      ctx.beginPath();
      ctx.moveTo(0, mouse.y);
      ctx.lineTo(width, mouse.y);
      ctx.moveTo(mouse.x, 0);
      ctx.lineTo(mouse.x, height);
      ctx.stroke();

      // 마우스 타겟 링
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 25, 0, Math.PI * 2);
      ctx.stroke();

      // 마우스 타겟 외곽선 및 텍스트 박스
      ctx.save();
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.rect(mouse.x + 35, mouse.y - 18, 90, 32);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = 'rgba(45, 52, 54, 0.55)';
      ctx.fillText(`X-COORD: ${Math.floor(mouse.x)}`, mouse.x + 40, mouse.y - 6);
      ctx.fillText(`Y-COORD: ${Math.floor(mouse.y)}`, mouse.x + 40, mouse.y + 8);
    }
  }

  // 모션 그래픽 루프
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 백그라운드 블루 & 하늘색 그라데이션 구체
    const time = Date.now() * 0.0005;
    const blob1X = width * 0.3 + Math.sin(time) * 100;
    const blob1Y = height * 0.4 + Math.cos(time * 0.8) * 120;
    const blob2X = width * 0.7 + Math.cos(time * 1.2) * 150;
    const blob2Y = height * 0.6 + Math.sin(time * 0.9) * 100;

    // 첫번째 큰 구체 (무채색 차콜)
    let gradient1 = ctx.createRadialGradient(blob1X, blob1Y, 10, blob1X, blob1Y, Math.min(width, height) * 0.25);
    gradient1.addColorStop(0, 'rgba(45, 52, 54, 0.02)');
    gradient1.addColorStop(1, 'rgba(45, 52, 54, 0)');
    ctx.fillStyle = gradient1;
    ctx.beginPath();
    ctx.arc(blob1X, blob1Y, Math.min(width, height) * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // 두번째 큰 구체 (무채색 그레이)
    let gradient2 = ctx.createRadialGradient(blob2X, blob2Y, 10, blob2X, blob2Y, Math.min(width, height) * 0.3);
    gradient2.addColorStop(0, 'rgba(127, 140, 141, 0.015)');
    gradient2.addColorStop(1, 'rgba(127, 140, 141, 0)');
    ctx.fillStyle = gradient2;
    ctx.beginPath();
    ctx.arc(blob2X, blob2Y, Math.min(width, height) * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 기하학 파티클 업데이트 및 드로우
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }
  animate();

  /* ------------------------------------------
     2. 헤더 스크롤 제어 및 스크롤 진행 바
     ------------------------------------------ */
  const header = document.getElementById('main-header');
  const progressBar = document.getElementById('scroll-progress');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // 헤더 투명도/크기 조절
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // 상단 진행바 연동
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }

    // 스크롤 스파이 (Scroll Spy)
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 150) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

  /* ------------------------------------------
     3. 모바일 내비게이션 토글
     ------------------------------------------ */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const icon = navToggle.querySelector('i');
    if (navMenu.classList.contains('open')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });

  // 메뉴 링크 클릭 시 모바일 메뉴 닫기
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });

  /* ------------------------------------------
     4. 프로필 카드 뒤집기 (모바일 대응 터치 이벤트)
     ------------------------------------------ */
  const profileCard = document.querySelector('.profile-card');
  profileCard.addEventListener('click', () => {
    profileCard.classList.toggle('flipped');
  });

  /* ------------------------------------------
     5. Intersection Observer를 활용한 요소 스크롤 연출
     ------------------------------------------ */
  // 게이지 애니메이션 트리거
  const statsSection = document.querySelector('.stats-panel');
  const statProgressBars = document.querySelectorAll('.stat-progress-bar');
  const statTargets = ['70%', '70%', '40%', '40%', '80%', '90%', '80%'];

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statProgressBars.forEach((bar, index) => {
          setTimeout(() => {
            bar.style.width = statTargets[index];
          }, index * 150);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01 });

  statsObserver.observe(statsSection);

  // 이력 및 프로젝트 카드 서서히 나타나는 효과 (Reveal Effect)
  const revealElements = document.querySelectorAll('.timeline-item, .project-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01 });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  /* ------------------------------------------
     6. 콘페티(Confetti) 이펙트 구현
     ------------------------------------------ */
  const confettiCanvas = document.getElementById('confetti-canvas');
  const cCtx = confettiCanvas.getContext('2d');
  let cWidth = confettiCanvas.width = window.innerWidth;
  let cHeight = confettiCanvas.height = window.innerHeight;
  let confettiActive = false;
  let confettiPieces = [];

  window.addEventListener('resize', () => {
    cWidth = confettiCanvas.width = window.innerWidth;
    cHeight = confettiCanvas.height = window.innerHeight;
  });

  const confettiColors = ['#a78bfa', '#ffc6ff', '#98ece0', '#e8ffb7', '#ffadad', '#ffd6a5'];

  class ConfettiPiece {
    constructor() {
      this.x = Math.random() * cWidth;
      this.y = -20;
      this.size = Math.random() * 8 + 6;
      this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = Math.random() * 5 + 3;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
    }

    draw() {
      cCtx.save();
      cCtx.translate(this.x, this.y);
      cCtx.rotate(this.rotation * Math.PI / 180);
      cCtx.fillStyle = this.color;
      cCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      cCtx.restore();
    }
  }

  function launchConfetti() {
    confettiPieces = [];
    for (let i = 0; i < 150; i++) {
      confettiPieces.push(new ConfettiPiece());
    }
    if (!confettiActive) {
      confettiActive = true;
      animateConfetti();
    }
  }

  function animateConfetti() {
    if (!confettiActive) return;
    cCtx.clearRect(0, 0, cWidth, cHeight);

    confettiPieces.forEach((p, index) => {
      p.update();
      p.draw();
      if (p.y > cHeight) {
        confettiPieces.splice(index, 1);
      }
    });

    if (confettiPieces.length > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiActive = false;
      cCtx.clearRect(0, 0, cWidth, cHeight);
    }
  }

  /* ------------------------------------------
     7. 연락처 모의 채팅 & 폼 전송 이벤트
     ------------------------------------------ */
  const contactForm = document.getElementById('portfolio-contact-form');
  const chatMessages = document.getElementById('chat-messages');
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const purposeInput = document.getElementById('contact-purpose');
    const budgetInput = document.getElementById('contact-budget');
    const dateInput = document.getElementById('contact-date');
    const messageInput = document.getElementById('contact-message');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const purpose = purposeInput.value.trim();
    const budget = budgetInput.value.trim();
    const date = dateInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !email || !message) return;

    // 1. 유저 메시지(발신) 화면 추가
    const userMessageHTML = `
      <div class="chat-message outgoing">
        <div class="avatar"><i class="fa-solid fa-user"></i></div>
        <div class="message-bubble">
          <strong>${name} (${email})</strong><br>
          📌 <strong>용건:</strong> ${purpose}<br>
          💰 <strong>예산:</strong> ${budget}<br>
          📅 <strong>마감일:</strong> ${date}<br>
          💬 <strong>의뢰 내용:</strong><br>${message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
    chatMessages.insertAdjacentHTML('beforeend', userMessageHTML);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 폼 초기화
    nameInput.value = '';
    emailInput.value = '';
    purposeInput.value = '';
    budgetInput.value = '';
    dateInput.value = '';
    messageInput.value = '';

    // 2. 입력 로딩 효과
    const typingIndicatorHTML = `
      <div class="chat-message incoming" id="typing-indicator">
        <div class="avatar"><i class="fa-solid fa-laptop-code"></i></div>
        <div class="message-bubble">
          <i class="fa-solid fa-ellipsis fa-bounce"></i> 윤정님이 입력 중입니다...
        </div>
      </div>
    `;
    setTimeout(() => {
      chatMessages.insertAdjacentHTML('beforeend', typingIndicatorHTML);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);

    // 3. 윤정이의 유쾌한 답변(수신) 추가
    setTimeout(() => {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();

      const responses = [
        `우와, ${name}님! 상세한 의뢰 메시지 정말 감사해요! 💌 제 꼼꼼하고 탄탄한 퍼블리싱 실력으로 이메일(${email})을 통해 제안과 예산 일정에 관한 회신을 신속하게 보내드리겠습니다! 조금만 기다려주세요! 😊`,
        `상세 의뢰서 도착 완료! ✨ ${name}님, 저 조윤정의 가능성을 믿고 상세히 적어주셔서 진심으로 기뻐요! 이메일(${email})로 반갑고 신뢰 가득하게 연락드리겠습니다! 🚀`,
        `반갑습니다, ${name}님! 적어주신 소중한 의뢰 조건들(마감일/예산)을 꼼꼼히 확인하고 이메일(${email})로 정확하고 빠른 소통으로 피드백을 전달해 드리겠습니다. 멋진 파트너십 기대합니다! 🌟`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const yoonjungResponseHTML = `
        <div class="chat-message incoming">
          <div class="avatar"><i class="fa-solid fa-laptop-code"></i></div>
          <div class="message-bubble">${randomResponse}</div>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', yoonjungResponseHTML);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // 축하 폭죽 발사!
      launchConfetti();
    }, 2000);
  });
});
