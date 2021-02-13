import React, { useEffect, useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ReactMic } from "react-mic";
import axios from "axios";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;
const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250,
});

const DND = () => {
  const [datas, setDatas] = useState([]);
  const [text, setText] = useState("");
  const [lastId, setLastId] = useState(0);
  const [record, setRecord] = useState();
  const [recordBlob, setRecordBlob] = useState();
  const [blobState, setBlobState] = useState();
  const [result, setResult] = useState("");
  const textInput = useRef();

  let blobData;
  let formData = new FormData();

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(datas, result.source.index, result.destination.index);

    setDatas(items);
  };

  const onClick = (e) => {
    if (text === "") {
      alert("할일을 입력해주세요.");
    } else {
      setDatas([...datas, { id: String(lastId), content: text }]);
      setText("");
      setLastId(lastId + 1);
    }
  };

  const startRecording = () => {
    setRecord(true);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onData = (recordedBlob) => {
    console.log("chunk of real-time data is: ", recordedBlob);
  };

  const onStop = async (recordedBlob) => {
    console.log("recordedBlob is: ", recordedBlob);
    //setRecordBlob(recordedBlob.blobURL);
    //setBlobState(await fetch(recordedBlob.blobURL).then((r) => r.blob()));
    blobData = await fetch(recordedBlob.blobURL).then((r) => r.blob());
    //blobData = recordedBlob.blob;

    formData.append("audio-file", blobData);
    for (let value of formData.values()) {
      console.log("value", value);
    }
    console.log("blobData", blobData);
    const stt = async () => {
      //const url = window.URL.createObjectURL(blobData);
      let config = { headers: { "content-type": "multipart/form-data" } };
      const data = await axios.post(
        "http://localhost:3001/stt",
        formData,
        config
      );
      const split = data.data.body.split(":");
      const split2 = split[1].replace('"', "");
      const split3 = split2.replace("}", "");
      const split4 = split3.replace('"', "");

      console.log("data", split4);
      console.log(textInput);
      setDatas([...datas, { id: String(lastId), content: split4 }]);
      setText("");
      setLastId(lastId + 1);
      console.log(datas);

      setResult(split4);
    };
    stt();

    const saveData = (blobData) => {
      const a = document.createElement("a");
      a.style = "display: none";
      const etc = (data) => {
        const url = window.URL.createObjectURL(data);
        a.href = url;
        a.download = "test.mp3";
        a.click();
        window.URL.revokeObjectURL(url);
      };
      return etc(blobData);
    };
    saveData(blobData);

    /*return fetch("http://localhost:3001/stt", {
      method: "POST",
      body: formData,
      
    });*/
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "100px",
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {datas.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <>
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                            id={item.id}
                          >
                            {item.content}
                            <button
                              onClick={(e) => {
                                console.log(e.target.parentNode.id);
                                const newDatas = datas.filter(
                                  (data) =>
                                    String(data.id) !==
                                    String(e.target.parentNode.id)
                                );
                                setDatas(newDatas);
                              }}
                              style={{ alignSelf: "between" }}
                            >
                              x
                            </button>
                          </div>
                        </>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <input
                    type="text"
                    ref={textInput}
                    value={text}
                    onKeyPress={(e) => {
                      if (e.charCode === 13) {
                        onClick();
                      }
                    }}
                    onChange={(e) => {
                      setText(e.target.value);
                      console.log(e.target.value);
                    }}
                  />

                  <button onClick={onClick}>plus</button>
                </div>

                <div>
                  <ReactMic
                    mimeType="audio/wav"
                    record={record}
                    className="sound-wave"
                    onStop={onStop}
                    onData={onData}
                    strokeColor="#000000"
                    backgroundColor="#FF4081"
                  />
                  <button onClick={startRecording} type="button">
                    Start
                  </button>
                  <button onClick={stopRecording} type="button">
                    Stop
                  </button>
                </div>
              </div>
            </>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DND;
