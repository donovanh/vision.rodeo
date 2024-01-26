addEventListener("scroll", (event) => {});

onscroll = () => {
	const scrollPos = window.scrollY;
	const targetDepth = 400;
	const scrollRatio = scrollPos / targetDepth;

	// Apply overlay
	const overlay = document.getElementById("overlay");
	overlay.style.opacity = scrollRatio > 1 ? 1 : scrollRatio;

	// Adjust header transform
	const header = document.getElementById("header");
	if (scrollRatio < 1.5) {
		header.style.opacity = 1;
		header.style.pointerEvents = "auto";
		header.style.transform = `rotateZ(${scrollRatio * 5}deg) rotateY(${
			scrollRatio * 80
		}deg) translateZ(-${scrollRatio * 40}vw)`;
	} else {
		header.style.opacity = 0;
		header.style.pointerEvents = "none";
	}
};
