import { useEffect, useState, useRef } from 'react';

import PostItem from './PostItem.jsx';



export default function PostFeed({ posts }) {

const [latestId, setLatestId] = useState(null);

const prevTopIdRef = useRef(posts && posts[0] ? posts[0].id : null);



useEffect(() => {

if (!posts || posts.length === 0) return;



const currentTopPost = posts[0];

const currentTopId = currentTopPost.id;



// 【自分用】表示された瞬間に生まれたて（1.5秒以内）なら光らせる

const postAgeMs = Date.now() - new Date(currentTopPost.createdAt).getTime();

if (postAgeMs < 1500) {

setLatestId(currentTopId);

const timer = setTimeout(() => setLatestId(null), 3000);

prevTopIdRef.current = currentTopId;

return () => clearTimeout(timer);

}



// 【みんな用】新しく他人のデータが降ってきたら光らせる

if (currentTopId !== prevTopIdRef.current) {

setLatestId(currentTopId);

const timer = setTimeout(() => setLatestId(null), 3000);

prevTopIdRef.current = currentTopId;

return () => clearTimeout(timer);

}

}, [posts]);



return (

<section className="feed" aria-label="みんなの記録">

{/* 🌟ここに「滑り込み」と「光る余韻」のCSSアニメーションを両方仕込みます */}

<style>{`

/* 1. 下にスルスルと押し下げながら、上から滑り込ませる魔法 */

@keyframes slideInAndDown {

0% {

opacity: 0;

transform: translateY(-20px); /* 20px上から */

max-height: 0;

margin-bottom: 0;

padding-top: 0;

padding-bottom: 0;

}

100% {

opacity: 1;

transform: translateY(0); // 定位置に着地

max-height: 200px; /* 隙間を広げて下の行を押し下げる */

margin-bottom: 16px;

}

}



/* 2. いつもの静かに光る魔法 */

@keyframes softGlow {

0% {

background-color: transparent;

box-shadow: 0 0 0px transparent;

}

15% {

background-color: var(--glow-color-light);

box-shadow: 0 0 12px var(--glow-color);

}

100% {

background-color: transparent;

box-shadow: 0 0 0px transparent;

}

}



/* 新しい投稿だけにこの2つのアニメーションを同時にかける */

.new-post-animation {

animation:

slideInAndDown 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards,

softGlow 3s cubic-bezier(0.25, 1, 0.5, 1) forwards;

border-radius: 6px;

overflow: hidden;

}



/* 最初からある古い投稿の並び（16pxの間隔を維持） */

.old-post-item {

margin-bottom: 16px;

}

`}</style>



<ul className="post-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>

{posts.map((post) => {

const isLatest = post.id === latestId;

const glowColor = post.colorHex;

const glowColorLight = post.colorHex + '25';



return (

<li

key={post.id}

className={isLatest ? 'new-post-animation' : 'old-post-item'}

style={{

'--glow-color': glowColor,

'--glow-color-light': glowColorLight,

transition: 'all 0.3s ease'

}}

>

<PostItem post={post} />

</li>

);

})}

</ul>

</section>

);

}