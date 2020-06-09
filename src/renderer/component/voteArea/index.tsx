import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import './style.less';


var camera, scene, renderer;
var geometry, material, mesh;



function init() {

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.z = 1;

  scene = new THREE.Scene();

  geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5);
  material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('gl').appendChild(renderer.domElement);

}

function animate() {

  /* requestAnimationFrame(animate);

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02; */

  renderer.render(scene, camera);

}

interface IVoteArea { }

interface IVote {
  name: string;
  count: number;
  editable?: boolean;
}

const defaultValue = {
  name: '',
  editable: true,
  count: 0
}

const MAXCOUNT = 5;

/**
 * 主要负责投票管理与显示
 * @param props 
 */
export default function VoteArea(props: Readonly<IVoteArea>) {
  const [voteList, setVoteList] = useState<IVote[]>([]);

  const onVoteAdd = () => {
    if (voteList.length === MAXCOUNT) {
      alert('最多5个')
      return;
    }
    setVoteList([{ ...defaultValue }, ...voteList])
  }

  const onValueChange = (name: string, index: number) => {
    voteList[index].name = name;
    setVoteList([...voteList]);
  }

  const onEditableChange = (index: number) => {
    voteList[index].editable = !voteList[index].editable;
    setVoteList([...voteList]);
  }

  useEffect(() => {
    init();
    animate();
  }, []);

  return <div className="vote-area full-height flex-appended">
    <div className="vote-area__list">
      <button onClick={onVoteAdd}>新增投票</button>
      {
        voteList.map((item: IVote, index: number) => {
          return item.editable ?
            <input className="vote-item" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.keyCode === 13) {
                onEditableChange(index);
              }
            }} key={index} type="text" onChange={(e) => {
              onValueChange(e.target.value, index)
            }} value={item.name} />
            :
            <span onDoubleClick={() => {
              onEditableChange(index);
            }} className="vote-item" key={index}>{item.name}</span>
        })
      }
    </div>
    <div id="gl"></div>
  </div>
}
