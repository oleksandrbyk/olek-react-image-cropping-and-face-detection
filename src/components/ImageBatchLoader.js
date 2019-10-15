import React from "react";
import AvatarEditor from "react-avatar-editor";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import './ImageBatchLoader.css'

class ImageBatchLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      croppedImages: [],
      currentFileIndex: -1,
      resolution: 1,
      width: 250,
      height: 250,
      border: 50,
      scale: 1.2,
      rotate: 0
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
      currentFileIndex: 0
    });
  }

  cropImage = async () => {
    const { resolution } = this.state;

    // Convert cropped image to image file with correct resolution
    const canvas = this.editor.getImage();
    const promise = new Promise((resolve, reject) => {
      canvas.toBlob(resolve, "image/jpeg", resolution * 1);
    });
    const croppedImageFile = await promise.then(blob => {
      return new File([blob], "cropped image");
    });

    // Convert image file to DataURL
    const _this = this;
    const reader = new FileReader();
    reader.onload = function(e) {
      let { croppedImages, currentFileIndex } = _this.state
      croppedImages[currentFileIndex] = e.target.result
      _this.setState({ croppedImages });
    };
    reader.readAsDataURL(croppedImageFile);
  };

  render() {
    const {
      files,
      currentFileIndex,
      croppedImages,
      width,
      height,
      border,
      scale,
      rotate
    } = this.state;

    return (
      <Container>
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
                <label className="custom-file-label" for="inputGroupFile01">Choose image files</label>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="d-flex justify-content-between">
          <Col sm={6}>
            <Row>
              <Col className="text-left">
                <input
                  type="button"
                  value="Previous"
                  onClick={() => {
                    this.setState({
                      currentFileIndex: currentFileIndex - 1,
                      src: files[currentFileIndex - 1]
                    });
                  }}
                  disabled={currentFileIndex <= 0}
                />
              </Col>
              <Col className="text-left">
                <input
                  type="button"
                  value="Next"
                  onClick={() => {
                    this.setState({
                      currentFileIndex: currentFileIndex + 1,
                      src: files[currentFileIndex + 1]
                    });
                  }}
                  disabled={currentFileIndex === files.length - 1}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <AvatarEditor
                  ref={editor => (this.editor = editor)}
                  image={currentFileIndex >= 0 && files[currentFileIndex]}
                  width={width}
                  height={height}
                  border={border}
                  color={[255, 255, 255, 0.6]} // RGBA
                  scale={scale}
                  rotate={rotate}
                  crossOrigin="anonymous"
                />
              </Col>
            </Row>
          </Col>
          <Col sm={6}>
            <Row>
              <Col>
                <label for="customRange1">Width (pixel)</label>
                <input
                  type="number"
                  className="form-control"
                  value={width}
                  onChange={e => { this.setState({ width: e.currentTarget.value - 0 }) }}
                />
              </Col>
              <Col>
                <label for="customRange1">Height (pixel)</label>
                <input
                  type="number"
                  className="form-control"
                  value={height}
                  onChange={e => { this.setState({ height: e.currentTarget.value - 0 }) }}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <label for="customRange1">Resolution</label>
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
            <Row>
              <Col>
                <input type="button" className="btn btn-primary btn-block" value="Single Crop" onClick={() => this.cropImage()} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <img src={croppedImages.length ? croppedImages[currentFileIndex] : null } />
        </Row>
      </Container>
    );
  }
}

export default ImageBatchLoader;
