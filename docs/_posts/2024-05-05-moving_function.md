---
layout: post
title: 各种 moving function
categories:
  - algorithm
tags:
  - content
last_modified_at: 2024-05-15T16:56:17-08:00
---
## 场景
### moving mean

leetcode 239
- 用一个queue保存window里面的数据
- 每次+新进的数据-出去的数据

### moving median

leetcode 480

- naive: 保存window里的所有数据,排序, 找出median
	- 每次更新进出data的顺序
- 优化1: 当进出的data在median同一侧时, 不需要更新median
- 优化2: 不需要严格的排序, 只需要维护median两边堆的结构, 就可以找到left的最大值, 和right的最小值
	- 用window记录进出的data
	- 同样的data只存一个位置, 通过一个counter记录data的重复次数, 次数=0就是待删除的data
	- 记录left_heap, right_heap的实际size, 当两边size偏离的时候移动heap
	- 如果删除/移动的data在堆顶, 需要更新堆(把堆顶待删除的data全部删除)


- 错误方向:
	- 本来想像moving max一样只保留时间近的, median附近的data. 但是moving median中, 所有的元素都可能在之后变得重要, 所以要全部保留的
		- 如果window_size=k, 需要<2/k个更新的data, 或>2/k个更新的data, 才能确定这个data不可能成为median, 这个条件达成的概率很小


### moving min/max


leetcode 239

以max为例
- naive: 保存window里的所有数据, 找出max
- 优化1: 不需要每次计算min/max, 只需要当前max出window的时候重新计算
	- 记录当前max的值和index
	- con: 这样计算速度不稳定
		- 比如: window_size较大, 而数据又是降序排列的时候, 每新进一个数据都要计算一次max, 时间是O(k)
- 优化2: window里不需要全部保存, 用deque结构, 只需要按顺序保存可能成为local max的data和index (不符合降序的data永远不会成为max)
	- 当新data进入deque时, 把deque里<=它的data删除
	- deque里的当前max生命耗尽时, 需要移出deque
		- 用保存的index判断生命耗尽
		- 或保存一份window, 如果window移除data = deque的第一个data, 把data从deque里移除
			- deque里不会有重复data
	- deque里的第一个data就是local max
	- 例子: ![Pasted image 20240515165236.png]({{ '/docs/attachment/Pasted image 20240515165236.png' | relative_url }}){:width="300"} 
		- data6进入window后, 4,5就不可能成为local max了
		- data7进入window后, 6也不可能成为local max了

- 应用:
	- 动态调整画图界面适应data
	- mormophic filter去除基线漂移


## 结构

### deque(双向队列)

支持在两端进出
- 用途:
	- 实现LRU缓存(leetcode 146)

### heap(优先队列)

- priority_queue(C++), heapq(python)
- **heap的数据结构**:
	- <img src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Max-Heap-new.svg" alt="drawing" width="200"/>
	- parent比children大的完备二叉树(以最大堆为例)
		- 完备是指, 从上到下每层填满, 最后一层靠左排列
	- 可以用数组表示: 第 $i$个节点的左子节点编号为 $2i+1$，右子节点编号为 $2i+2$，父节点编号为 $⌊\frac{i−1}{2}⌋$ 
		- 完备的=可以连续存储, 数组可以在任意位置访问->可以做swap
- **heap支持的操作**: 都是把中间data和最后data互换, 然后在最后增删, 所以不会破坏完备性
	-  新插入一个元素(“上浮”操作): 把新data添到heap的尾部, 不断和parent比较, 并swap到合适位置 
		- 只需要O(logk) 的swap(如果要排序就需要O(k)个swap)
	- 移除heap 顶的元素(“下沉”操作): 和其children比较, 跟更大的那个swap, 直到到达底部, 删除
- **用途**: 
	- 调度器, 用来实时添加任务, 和取出最合适的任务进行执行
		- 比如优先级最高, 或截止时间最早的任务
	- 堆排序: 每轮找到最小的data排在后面, 时间复杂度是O(nlogn)
		- 时间稳定, inplace操作, 适合大数据量, 内存有限的场景

### hashtable

-  unordered_map(C++), Counter(python), dict, set

### multiset

- multiset(C++)
	- 类似set, 允许重复的data, 可以按顺序遍历

    


## 其它有用的链接

[1]  https://cplusplus.com/reference/unordered_map/unordered_map/
