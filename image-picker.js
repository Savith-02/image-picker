class Alert {
  constructor() {
    this.alertElement = document.getElementById("alert");
  }

  show(message, isError = true) {
    this.alertElement.textContent = message;
    this.alertElement.style.backgroundColor = isError ? "red" : "green";
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
  constructor(duplicatePolicy = { type: "none", max: 1 }) {
    this.images = [];
    this.duplicatePolicy = duplicatePolicy;
    this.imagePickerElement = document.getElementById("imagePicker");
    this.thumbnailsElement = document.getElementById("thumbnails");
    this.imageInput = document.getElementById("imageInput");
    this.downloadBtn = document.getElementById("downloadBtn");
    this.alert = new Alert();

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

const imagePicker = new ImagePicker({ type: "limited", max: 2 });
