import React from "react";
import { Container, Row, Col, Spinner } from 'react-bootstrap'
import './ImageBatchLoader.css'
import ReactCrop from 'react-image-crop';
import "react-image-crop/dist/ReactCrop.css";
import * as faceapi from 'face-api.js';
import _ from 'lodash';

class ImageBatchLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      src: [],
      croppedImages: [],
      isDetectedFace: true,
      currentFileIndex: -1,
      resolution: 1,
      crop: []
    };
  }

  filesUploader = (files) => {
    const maxSize = 4000000, minSize = 50000
    for(let i = 0; i < files.length; i++) {
      if(files[i].size > maxSize || files[i].size < minSize) {
        const error = 'Please pick the files what sizes are between 50000 byte and 4000000 byte\n'
        console.log(error);
        return;
      }
    }

    this.setState({
      files: files,
      currentFileIndex: 0,
      isDetectedFace: false,
      src: Array.from(files).map(file => URL.createObjectURL(file))
    })
  }

  setCrop = newCrop => {
    const { currentFileIndex } = this.state
    let { crop } = this.state
    let currentCrop = crop[currentFileIndex]
    if(!_.isEqual(newCrop, currentCrop)) {
      crop[currentFileIndex] = Object.assign({}, currentCrop, newCrop)
      this.setState({ crop })
    }
  }

  onImageLoaded = async image => {
    const { croppedImages, currentFileIndex } = this.state
    this.imageRef = image;
    if (croppedImages[currentFileIndex]) {
      this.setState({ isDetectedFace: true })
    } else {
      const { naturalWidth, naturalHeight, width, height } = image
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      const { box } = await faceapi.detectSingleFace(image)
      // In general, rateX is equal to rateY
      const rateX = width / naturalWidth, rateY = height / naturalHeight;

      this.setState({ isDetectedFace: true })
      this.setCrop({
        x: box._x * rateX,
        y: box._y * rateY,
        width: box._width * rateX,
        height: box._height * rateY
      })
    }
  }

  saveCroppedImage = async () => {
    const { crop, currentFileIndex } = this.state
    const _crop = crop[currentFileIndex]

    if (this.imageRef && _crop.width && _crop.height) {
      const croppedImage = await this.getCroppedImg(
        this.imageRef,
        _crop,
        "newFile.jpeg"
      );
      let { croppedImages } = this.state
      croppedImages[currentFileIndex] = croppedImage
      this.setState({ croppedImages })
    }
  }

  getCroppedImg(image, crop, fileName) {
    const { resolution } = this.state
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        // window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, "image/jpeg", resolution * 1);
    });
  }

  render() {
    const {
      files,
      src,
      currentFileIndex,
      croppedImages,
      isDetectedFace,
      crop
    } = this.state;

   return (
      <Container>
        {/* Begin - Image Files Loader */}
        <Row>
          <Col>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroupFileAddon01">Upload</span>
              </div>
              <div className="custom-file">
                <input
                  type="file"
                  className="custom-file-input"
                  multiple
                  onChange={e => this.filesUploader(e.currentTarget.files)}
                />
                <label className="custom-file-label">Choose image files</label>
              </div>
            </div>
          </Col>
        </Row>
        {/* End - Image Files Loader */}
        {/* Begin - property "width", "height", "resolution" */}
        <Row>
          <Col sm={3}>
            <label>Width (px)</label>
            <input
              type="number"
              className="form-control"
              value={crop[currentFileIndex] ? crop[currentFileIndex].width : 0}
              onChange={e => { this.setCrop({ width: e.currentTarget.value - 0 }) }}
            />
          </Col>
          <Col sm={3}>
            <label>Height (px)</label>
            <input
              type="number"
              className="form-control"
              value={crop[currentFileIndex] ? crop[currentFileIndex].height : 0}
              onChange={e => { this.setCrop({ height: e.currentTarget.value - 0 }) }}
            />
          </Col>
          <Col sm={6}>
            <label htmlFor="customRange">Resolution</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              className="custom-range"
              onChange={e => {
                this.setState({
                  resolution: e.currentTarget.value
                });
              }}
            />
          </Col>
        </Row>
        {/* End - property "width", "height", "resolution" */}
        {/* Begin - "Single Crop" Button */}
        <Row>
          <Col>
            <input type="button" className="btn btn-primary btn-block" value="Single Crop" onClick={this.saveCroppedImage} />
          </Col>
        </Row>
        {/* End - "Single Crop" Button */}
        {/* Begin - "Previous", "Next" Button */}
        <Row>
          <Col className="text-left">
            <input
              type="button"
              value="Previous"
              onClick={() => {
                this.setState({
                  currentFileIndex: currentFileIndex - 1,
                  isDetectedFace: false,
                });
              }}
              disabled={currentFileIndex <= 0}
            />
          </Col>
          <Col className="text-right">
            <input
              type="button"
              value="Next"
              onClick={() => {
                this.setState({
                  currentFileIndex: currentFileIndex + 1,
                  isDetectedFace: false,
                });
              }}
              disabled={currentFileIndex === files.length - 1}
            />
          </Col>
        </Row>
        {/* End - "Previous", "Next" Button */}
        {/* Begin - react-image-crop */}
        <Row>
          <Col>
            <ReactCrop
              disabled={!isDetectedFace}
              imageStyle={{ width: "100%", height: "100%" }}
              src={src[currentFileIndex]}
              crop={crop[currentFileIndex]}
              onImageLoaded={this.onImageLoaded}
              onChange={this.setCrop}
            />
          </Col>
        </Row>
        {/* End - react-image-crop */}
        {/* Begin - Preview cropped image */}
        <Row>
          <img id="overlay" src={croppedImages.length ? croppedImages[currentFileIndex] : null } />
        </Row>
        {/* End - Preview cropped image */}
      </Container>
    );
  }
}

export default ImageBatchLoader;
