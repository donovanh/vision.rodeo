addEventListener("scroll", (event) => {});

let scrollPos = window.scrollY;
let targetDepth = 400;
let scrollRatio = scrollPos / targetDepth;

function applyOverlay(scrollRatio) {
	const overlay = document.getElementById("overlay");
	overlay.style.opacity = scrollRatio > 1 ? 1 : scrollRatio;
}

function adjustHeaderTransform(scrollRatio) {
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
}

window.document.onload = () => {
	applyOverlay(scrollRatio);
	adjustHeaderTransform(scrollRatio);
};

onscroll = () => {
	scrollPos = window.scrollY;
	targetDepth = 400;
	scrollRatio = scrollPos / targetDepth;

	applyOverlay(scrollRatio);
	adjustHeaderTransform(scrollRatio);
};
