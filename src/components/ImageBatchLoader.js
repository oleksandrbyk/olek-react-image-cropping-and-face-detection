import React from 'react'
import AvatarEditor from 'react-avatar-editor'

class ImageBatchLoader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      files: [],
      currentFileIndex: -1,
      croppedImage: null,
      resolution: 1,
      width: 250,
      height: 250,
      border: 50,
      scale: 1.2,
      rotate: 0
    }
  }

  cropImage = async () => {
    const { resolution } = this.state

    // Convert cropped image to image file with correct resolution
    const canvas = this.editor.getImage()
    const promise = new Promise((resolve, reject)  => {
      canvas.toBlob(resolve, 'image/jpeg', resolution * 1);
    })
    const croppedImageFile = await promise.then((blob) => {
      return new File([blob], 'cropped image');
    })

    // Convert image file to DataURL
    const _this = this
    const reader = new FileReader();
    reader.onload = function (e) {
      _this.setState({ croppedImage: e.target.result })
    }
    reader.readAsDataURL(croppedImageFile);
  }

  render() {
    const {
      files,
      currentFileIndex,
      croppedImage,
      width,
      height,
      border,
      scale,
      rotate
    } = this.state

    return (
      <div>
        <AvatarEditor
          ref={(editor) => this.editor = editor}
          image={currentFileIndex >= 0 && files[currentFileIndex]}
          width={width}
          height={height}
          border={border}
          color={[255, 255, 255, 0.6]} // RGBA
          scale={scale}
          rotate={rotate}
          crossOrigin="anonymous"
        />

        <input
          type="file"
          multiple
          onChange={e => {
            this.setState({
              files: e.currentTarget.files,
              currentFileIndex: 0,
            })
          }}
        />

        <input
          type="button" value="Previous"
          onClick={() => { this.setState({ currentFileIndex: currentFileIndex - 1, src: files[currentFileIndex - 1] }) }}
          disabled={!currentFileIndex}
        />

        <input
          type="button" value="Next"
          onClick={() => { this.setState({ currentFileIndex: currentFileIndex + 1, src: files[currentFileIndex + 1] }) }}
          disabled={currentFileIndex === files.length - 1}
        />

        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          onChange={e => {
            this.setState({
              resolution: e.currentTarget.value
            })
          }}
        />

        <input
          type="button"
          value="Crop"
          onClick={() => this.cropImage()}
        />

        <img src={croppedImage} />
      </div>
    )
  }
}

export default ImageBatchLoader