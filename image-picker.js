class Alert {
  constructor() {
    this.alertElement = document.getElementById("alert");
  }

  show(message, isError = true) {
    this.alertElement.textContent = message;
    this.alertElement.style.backgroundColor = isError
      ? "var(--alert-error-bg)"
      : "var(--alert-success-bg)";
    this.alertElement.style.display = "block";
    setTimeout(() => {
      this.alertElement.style.display = "none";
    }, 3000);
  }
}

class Thumbnail {
  constructor(image, index) {
    this.image = image;
    this.index = index;
    this.element = document.createElement("div");
    this.element.className = "thumbnail";
    this.element.innerHTML = `
      <img src="${image.src}" alt="${image.name}">
      <div class="cross" onclick="imagePicker.removeImage(${index})">X</div>`;
  }

  getElement() {
    return this.element;
  }
}

class ImagePicker {
  constructor(
    duplicatePolicy = { type: "none", max: 1 },
    style = "app",
    theme = {}
  ) {
    this.images = [];
    this.duplicatePolicy = duplicatePolicy;
    this.style = style;
    this.theme = theme;
    this.imagePickerElement = document.getElementById("imagePicker");
    this.thumbnailsElement = document.getElementById("thumbnails");
    this.imageInput = document.getElementById("imageInput");
    this.downloadBtn = document.getElementById("downloadBtn");
    this.alert = new Alert();

    this.applyTheme();
    this.applyStyle();

    this.imagePickerElement.addEventListener("click", () =>
      this.imageInput.click()
    );
    this.imageInput.addEventListener("change", (e) =>
      this.handleImageSelection(e.target.files)
    );
    this.downloadBtn.addEventListener("click", () => this.downloadImages());

    // Drag and Drop
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.imagePickerElement.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false
      );
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      this.imagePickerElement.addEventListener(
        eventName,
        () => this.imagePickerElement.classList.add("active"),
        false
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      this.imagePickerElement.addEventListener(
        eventName,
        () => this.imagePickerElement.classList.remove("active"),
        false
      );
    });

    this.imagePickerElement.addEventListener("drop", (e) =>
      this.handleImageSelection(e.dataTransfer.files)
    );
  }

  applyTheme() {
    const root = document.documentElement;
    Object.keys(this.theme).forEach((key) => {
      root.style.setProperty(`--${key}`, this.theme[key]);
    });
  }

  applyStyle() {
    this.imagePickerElement.classList.add(this.style);
  }

  handleImageSelection(files) {
    for (const file of files) {
      if (this.validateImage(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageObject = { src: e.target.result, name: file.name };
          if (this.canAddImage(imageObject)) {
            this.images.push(imageObject);
            this.displayImages();
            this.showSuccess();
          } else {
            this.alert.show("Duplicate image not allowed");
          }
        };
        reader.readAsDataURL(file);
      } else {
        this.alert.show("Invalid file type. Only images are allowed");
      }
    }
  }

  validateImage(file) {
    return file.type.startsWith("image/");
  }

  canAddImage(image) {
    switch (this.duplicatePolicy.type) {
      case "none":
        return !this.images.some((img) => img.src === image.src);
      case "limited":
        const count = this.images.filter((img) => img.src === image.src).length;
        return count < this.duplicatePolicy.max;
      case "no-consecutive":
        return (
          this.images.length === 0 ||
          this.images[this.images.length - 1].src !== image.src
        );
      default:
        return true;
    }
  }

  displayImages() {
    this.thumbnailsElement.innerHTML = "";
    this.images.forEach((image, index) => {
      const thumbnail = new Thumbnail(image, index);
      this.thumbnailsElement.appendChild(thumbnail.getElement());
    });
  }

  removeImage(index) {
    this.images.splice(index, 1);
    this.displayImages();
  }

  showSuccess() {
    this.imagePickerElement.classList.add("success");
    setTimeout(() => {
      this.imagePickerElement.classList.remove("success");
    }, 1000);
  }

  downloadImages() {
    // Implementation for downloading images as a zip goes here.
    // This could involve using a library like JSZip and triggering a download.
    console.log("Download functionality to be implemented");
  }
}

// Custom default theme
const defaultTheme = {
  "background-color": "#f0f0f0",
  "primary-color": "#2a9d8f",
  "secondary-color": "#264653",
  "text-color": "#000",
  "alert-error-bg": "#e76f51",
  "alert-success-bg": "#2a9d8f",
};

// Instantiate the ImagePicker with style and theme parameters
const imagePicker = new ImagePicker(
  { type: "limited", max: 2 },
  "app",
  defaultTheme
);
