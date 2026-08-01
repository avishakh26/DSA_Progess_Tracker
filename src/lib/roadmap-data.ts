/**
 * Static curriculum for DSA Journey.
 *
 * Phase metadata (titles, targets) is not stored in the database — only a
 * user's per-topic progress is. When a user signs up, `provisionUser()` copies
 * TOPICS / MONTHLY_GOALS / RATING_NODES into their account as editable rows.
 */

export type PhaseMeta = {
  phase: number;
  title: string;
  subtitle: string;
  target: string | null;
  accent: string; // tailwind-ish hex used for the phase ring / glow
};

export type TopicSeed = {
  slug: string;
  title: string;
  phase: number;
  description: string;
  resources: string; // newline-separated "Label|url"
};

const cpAlgo = (path: string, label: string) =>
  `${label}|https://cp-algorithms.com/${path}`;

export const PHASES: PhaseMeta[] = [
  {
    phase: 1,
    title: "C++ & STL Foundation",
    subtitle: "Language fundamentals and the standard template library",
    target: "80–100 Easy CF Problems",
    accent: "#3b82f6",
  },
  {
    phase: 2,
    title: "Mathematics",
    subtitle: "Number theory and modular arithmetic",
    target: "30–40 Problems",
    accent: "#6366f1",
  },
  {
    phase: 3,
    title: "Searching",
    subtitle: "Linear and binary search, including search on the answer",
    target: "40+ Problems",
    accent: "#8b5cf6",
  },
  {
    phase: 4,
    title: "Two Pointers & Sliding Window",
    subtitle: "Window techniques, prefix sums and difference arrays",
    target: "50+ Problems",
    accent: "#a855f7",
  },
  {
    phase: 5,
    title: "Sorting",
    subtitle: "Classic sorts, STL sort and custom comparators",
    target: null,
    accent: "#d946ef",
  },
  {
    phase: 6,
    title: "Recursion & Backtracking",
    subtitle: "Exhaustive search with pruning",
    target: null,
    accent: "#ec4899",
  },
  {
    phase: 7,
    title: "Greedy",
    subtitle: "Exchange arguments, scheduling and sorting-based greedy",
    target: "70+ Problems",
    accent: "#f43f5e",
  },
  {
    phase: 8,
    title: "Stack & Queue",
    subtitle: "Monotonic structures and linear-time range answers",
    target: null,
    accent: "#f97316",
  },
  {
    phase: 9,
    title: "Linked List",
    subtitle: "Pointer manipulation and cycle detection",
    target: null,
    accent: "#f59e0b",
  },
  {
    phase: 10,
    title: "Trees",
    subtitle: "Binary trees, BSTs, traversals and ancestor queries",
    target: null,
    accent: "#eab308",
  },
  {
    phase: 11,
    title: "Heap",
    subtitle: "Priority queues and heap-based selection",
    target: null,
    accent: "#84cc16",
  },
  {
    phase: 12,
    title: "Graph",
    subtitle: "Traversal, shortest paths, spanning trees and connectivity",
    target: "150+ Problems",
    accent: "#22c55e",
  },
  {
    phase: 13,
    title: "Dynamic Programming",
    subtitle: "From memoisation to digit, bitmask and tree DP",
    target: "200+ Problems",
    accent: "#10b981",
  },
  {
    phase: 14,
    title: "Advanced Topics",
    subtitle: "Range structures, string algorithms and specialised techniques",
    target: null,
    accent: "#14b8a6",
  },
];

export const TOPICS: TopicSeed[] = [
  // ── Phase 1 — C++ & STL Foundation ────────────────────────
  {
    slug: "variables-io",
    title: "Variables, Data Types & Fast I/O",
    phase: 1,
    description:
      "Integer widths and overflow, floating point pitfalls, and cin/cout untying for competitive I/O speed.",
    resources:
      "Fast I/O in C++|https://www.geeksforgeeks.org/fast-io-for-competitive-programming/\nCP Handbook (Ch.1)|https://cses.fi/book/book.pdf",
  },
  {
    slug: "loops-conditionals",
    title: "Loops & Conditionals",
    phase: 1,
    description:
      "for / while / do-while, nested loops and loop-invariant reasoning about complexity.",
    resources: "Learn C++ — Loops|https://www.learncpp.com/",
  },
  {
    slug: "functions",
    title: "Functions & Scope",
    phase: 1,
    description:
      "Parameter passing by value vs reference, default arguments, overloading and lambdas.",
    resources: "Lambdas in C++|https://en.cppreference.com/w/cpp/language/lambda",
  },
  {
    slug: "arrays",
    title: "Arrays & 2D Arrays",
    phase: 1,
    description:
      "Static arrays, multi-dimensional indexing, and traversal patterns over grids.",
    resources: "Arrays|https://www.geeksforgeeks.org/c-arrays/",
  },
  {
    slug: "strings",
    title: "Strings",
    phase: 1,
    description:
      "std::string operations, substr, find, character arithmetic and frequency counting.",
    resources: "std::string|https://en.cppreference.com/w/cpp/string/basic_string",
  },
  {
    slug: "pointers-references",
    title: "Pointers & References",
    phase: 1,
    description:
      "Address arithmetic, references vs pointers, and passing containers without copying.",
    resources: "Pointers|https://www.learncpp.com/cpp-tutorial/introduction-to-pointers/",
  },
  {
    slug: "recursion-basics",
    title: "Recursion Basics",
    phase: 1,
    description:
      "Base cases, the call stack, and converting simple loops into recursive form.",
    resources: "Recursion|https://www.geeksforgeeks.org/recursion/",
  },
  {
    slug: "big-o",
    title: "Time & Space Complexity (Big O)",
    phase: 1,
    description:
      "Asymptotic analysis, the 10^8 operations rule of thumb, and reading constraints to pick an algorithm.",
    resources:
      "Complexity|https://cses.fi/book/book.pdf\nBig-O Cheat Sheet|https://www.bigocheatsheet.com/",
  },
  {
    slug: "stl-vector",
    title: "STL — vector",
    phase: 1,
    description:
      "Dynamic arrays, amortised push_back, reserve, and 2D vectors for grids.",
    resources: "std::vector|https://en.cppreference.com/w/cpp/container/vector",
  },
  {
    slug: "stl-map-set",
    title: "STL — map, set & unordered variants",
    phase: 1,
    description:
      "Ordered vs hashed containers, lower_bound on sets, and when hashing gets anti-tested.",
    resources:
      "std::map|https://en.cppreference.com/w/cpp/container/map\nBlowing up unordered_map|https://codeforces.com/blog/entry/62393",
  },
  {
    slug: "stl-priority-queue",
    title: "STL — priority_queue, stack & queue",
    phase: 1,
    description:
      "Container adaptors, custom comparators, and min-heaps via greater<>.",
    resources:
      "std::priority_queue|https://en.cppreference.com/w/cpp/container/priority_queue",
  },
  {
    slug: "stl-algorithms",
    title: "STL — <algorithm> toolkit",
    phase: 1,
    description:
      "sort, lower_bound, upper_bound, next_permutation, accumulate, unique and __gcd.",
    resources: "Algorithms library|https://en.cppreference.com/w/cpp/algorithm",
  },

  // ── Phase 2 — Mathematics ─────────────────────────────────
  {
    slug: "number-theory-basics",
    title: "Number Theory Basics",
    phase: 2,
    description:
      "Divisors in O(√n), primality testing, and prime factorisation.",
    resources: cpAlgo("algebra/factorization.html", "Integer factorization"),
  },
  {
    slug: "gcd-lcm",
    title: "GCD & LCM",
    phase: 2,
    description:
      "Properties of gcd, lcm via gcd, and gcd over ranges/arrays.",
    resources: cpAlgo("algebra/euclid-algorithm.html", "Euclidean algorithm"),
  },
  {
    slug: "extended-euclidean",
    title: "Extended Euclidean Algorithm",
    phase: 2,
    description:
      "Bézout coefficients, linear Diophantine equations and modular inverses.",
    resources: cpAlgo("algebra/extended-euclid-algorithm.html", "Extended Euclid"),
  },
  {
    slug: "sieve-of-eratosthenes",
    title: "Sieve of Eratosthenes",
    phase: 2,
    description:
      "Prime sieving in O(n log log n), smallest-prime-factor sieve and segmented sieve.",
    resources: cpAlgo("algebra/sieve-of-eratosthenes.html", "Sieve"),
  },
  {
    slug: "modular-arithmetic",
    title: "Modular Arithmetic",
    phase: 2,
    description:
      "Working under 1e9+7, modular inverse via Fermat, and safe multiplication.",
    resources: cpAlgo("algebra/module-inverse.html", "Modular inverse"),
  },
  {
    slug: "binary-exponentiation",
    title: "Binary Exponentiation",
    phase: 2,
    description:
      "Fast power in O(log n), modular exponentiation and matrix power as a generalisation.",
    resources: cpAlgo("algebra/binary-exp.html", "Binary exponentiation"),
  },
  {
    slug: "combinatorics",
    title: "Combinatorics & Pigeonhole",
    phase: 2,
    description:
      "nCr with precomputed factorials, inclusion-exclusion and basic counting arguments.",
    resources: cpAlgo("combinatorics/binomial-coefficients.html", "Binomial coefficients"),
  },

  // ── Phase 3 — Searching ───────────────────────────────────
  {
    slug: "linear-search",
    title: "Linear Search",
    phase: 3,
    description:
      "Scanning with early exit, sentinel tricks, and when O(n) is genuinely optimal.",
    resources: "Linear search|https://www.geeksforgeeks.org/linear-search/",
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    phase: 3,
    description:
      "The classic invariant, avoiding off-by-one, and lower_bound / upper_bound semantics.",
    resources: cpAlgo("num_methods/binary_search.html", "Binary search"),
  },
  {
    slug: "binary-search-on-answer",
    title: "Binary Search on Answer",
    phase: 3,
    description:
      "Turning an optimisation problem into a monotone predicate, then binary searching it.",
    resources:
      "Binary search the answer|https://codeforces.com/blog/entry/9354\nEDU — Binary Search|https://codeforces.com/edu/course/2",
  },
  {
    slug: "ternary-search",
    title: "Ternary Search",
    phase: 3,
    description:
      "Finding the extremum of a unimodal function over integers or reals.",
    resources: cpAlgo("num_methods/ternary_search.html", "Ternary search"),
  },

  // ── Phase 4 — Two Pointers & Sliding Window ───────────────
  {
    slug: "two-pointers",
    title: "Two Pointers",
    phase: 4,
    description:
      "Opposite-end and same-direction pointers on sorted data for pair and subarray problems.",
    resources: "Two pointers|https://codeforces.com/edu/course/2",
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    phase: 4,
    description:
      "Fixed and variable-size windows with an incrementally maintained aggregate.",
    resources:
      "Sliding window|https://www.geeksforgeeks.org/window-sliding-technique/",
  },
  {
    slug: "prefix-sum",
    title: "Prefix Sum",
    phase: 4,
    description:
      "1D and 2D prefix sums for O(1) range queries on a static array.",
    resources: cpAlgo("data_structures/prefix_sum.html", "Prefix sums"),
  },
  {
    slug: "difference-array",
    title: "Difference Array",
    phase: 4,
    description:
      "Batched range updates in O(1) each, materialised with one final prefix pass.",
    resources:
      "Difference array|https://www.geeksforgeeks.org/difference-array-range-update-query-o1/",
  },

  // ── Phase 5 — Sorting ─────────────────────────────────────
  {
    slug: "bubble-selection-insertion",
    title: "Bubble, Selection & Insertion Sort",
    phase: 5,
    description:
      "The O(n²) family — worth writing once to understand stability and adaptivity.",
    resources: "Sorting algorithms|https://www.geeksforgeeks.org/sorting-algorithms/",
  },
  {
    slug: "merge-sort",
    title: "Merge Sort",
    phase: 5,
    description:
      "Divide and conquer in O(n log n), plus counting inversions as a bonus.",
    resources: "Merge sort|https://www.geeksforgeeks.org/merge-sort/",
  },
  {
    slug: "quick-sort",
    title: "Quick Sort & Quickselect",
    phase: 5,
    description:
      "Partitioning, pivot choice, worst-case behaviour and k-th order statistics.",
    resources: "Quick sort|https://www.geeksforgeeks.org/quick-sort/",
  },
  {
    slug: "stl-sort-comparators",
    title: "STL sort & Custom Comparators",
    phase: 5,
    description:
      "Strict weak ordering, sorting structs, stable_sort and sorting by multiple keys.",
    resources: "std::sort|https://en.cppreference.com/w/cpp/algorithm/sort",
  },
  {
    slug: "counting-radix-sort",
    title: "Counting & Radix Sort",
    phase: 5,
    description:
      "Linear-time sorting when the key range is small — useful for suffix arrays later.",
    resources: "Counting sort|https://www.geeksforgeeks.org/counting-sort/",
  },

  // ── Phase 6 — Recursion & Backtracking ────────────────────
  {
    slug: "recursion-advanced",
    title: "Advanced Recursion",
    phase: 6,
    description:
      "Recursion trees, tail recursion, and reasoning about recursive complexity.",
    resources: "Recursion|https://www.geeksforgeeks.org/recursion/",
  },
  {
    slug: "subsets",
    title: "Subsets & Power Set",
    phase: 6,
    description:
      "Generating all 2^n subsets recursively and with bitmasks.",
    resources: "Subsets|https://leetcode.com/problems/subsets/",
  },
  {
    slug: "permutations",
    title: "Permutations",
    phase: 6,
    description:
      "Generating permutations by swapping, and next_permutation for lexicographic order.",
    resources: "Permutations|https://leetcode.com/problems/permutations/",
  },
  {
    slug: "n-queens",
    title: "N-Queens",
    phase: 6,
    description:
      "Backtracking with diagonal/column occupancy sets for pruning.",
    resources: "N-Queens|https://leetcode.com/problems/n-queens/",
  },
  {
    slug: "sudoku-solver",
    title: "Sudoku Solver",
    phase: 6,
    description:
      "Constraint propagation plus backtracking with most-constrained-cell ordering.",
    resources: "Sudoku Solver|https://leetcode.com/problems/sudoku-solver/",
  },

  // ── Phase 7 — Greedy ──────────────────────────────────────
  {
    slug: "greedy-basics",
    title: "Greedy Fundamentals & Exchange Argument",
    phase: 7,
    description:
      "Proving a greedy choice is safe — the exchange argument and counterexample hunting.",
    resources: "Greedy|https://cses.fi/book/book.pdf",
  },
  {
    slug: "interval-scheduling",
    title: "Interval Scheduling & Merging",
    phase: 7,
    description:
      "Sort by end time for maximum non-overlapping intervals; sweep for merging.",
    resources:
      "Interval scheduling|https://www.geeksforgeeks.org/activity-selection-problem-greedy-algo-1/",
  },
  {
    slug: "coin-problems",
    title: "Coin & Change Problems",
    phase: 7,
    description:
      "When greedy coin change is correct, and when you must fall back to DP.",
    resources: "Coin change|https://cses.fi/problemset/task/1634",
  },
  {
    slug: "sorting-plus-greedy",
    title: "Sorting + Greedy Patterns",
    phase: 7,
    description:
      "The single most common CF pattern — sort by a derived key, then sweep once.",
    resources: "CF Greedy problems|https://codeforces.com/problemset?tags=greedy",
  },

  // ── Phase 8 — Stack & Queue ───────────────────────────────
  {
    slug: "stack-basics",
    title: "Stack Fundamentals",
    phase: 8,
    description:
      "LIFO semantics, expression evaluation and simulating recursion iteratively.",
    resources: "Stack|https://en.cppreference.com/w/cpp/container/stack",
  },
  {
    slug: "queue-deque",
    title: "Queue & Deque",
    phase: 8,
    description:
      "FIFO, double-ended queues and their role in BFS and 0-1 BFS.",
    resources: "std::deque|https://en.cppreference.com/w/cpp/container/deque",
  },
  {
    slug: "balanced-parentheses",
    title: "Balanced Parentheses",
    phase: 8,
    description:
      "Bracket matching, longest valid substring and prefix-balance reasoning.",
    resources:
      "Valid Parentheses|https://leetcode.com/problems/valid-parentheses/",
  },
  {
    slug: "monotonic-stack",
    title: "Monotonic Stack",
    phase: 8,
    description:
      "Maintaining a sorted stack to answer nearest-greater/smaller in O(n).",
    resources:
      "Monotonic stack|https://www.geeksforgeeks.org/introduction-to-monotonic-stack/",
  },
  {
    slug: "next-greater-element",
    title: "Next Greater Element",
    phase: 8,
    description:
      "The canonical monotonic stack application, plus largest rectangle in histogram.",
    resources:
      "Next Greater Element|https://leetcode.com/problems/next-greater-element-i/",
  },
  {
    slug: "monotonic-queue",
    title: "Monotonic Queue (Sliding Window Maximum)",
    phase: 8,
    description:
      "Deque-based sliding window extremum in O(n) — a building block for DP optimisation.",
    resources:
      "Sliding Window Maximum|https://leetcode.com/problems/sliding-window-maximum/",
  },

  // ── Phase 9 — Linked List ─────────────────────────────────
  {
    slug: "singly-linked-list",
    title: "Singly Linked List",
    phase: 9,
    description:
      "Node structure, insertion/deletion, and dummy-head technique.",
    resources: "Linked list|https://www.geeksforgeeks.org/data-structures/linked-list/",
  },
  {
    slug: "doubly-linked-list",
    title: "Doubly & Circular Linked List",
    phase: 9,
    description:
      "Bidirectional traversal and O(1) removal given a node pointer — the basis of LRU caches.",
    resources:
      "Doubly linked list|https://www.geeksforgeeks.org/doubly-linked-list/",
  },
  {
    slug: "reverse-linked-list",
    title: "Reversal & Reordering",
    phase: 9,
    description:
      "Iterative and recursive reversal, reversing in k-groups, and palindrome checks.",
    resources:
      "Reverse Linked List|https://leetcode.com/problems/reverse-linked-list/",
  },
  {
    slug: "floyd-cycle-detection",
    title: "Floyd's Cycle Detection",
    phase: 9,
    description:
      "Tortoise and hare for cycle existence, cycle start and cycle length.",
    resources:
      "Linked List Cycle II|https://leetcode.com/problems/linked-list-cycle-ii/",
  },

  // ── Phase 10 — Trees ──────────────────────────────────────
  {
    slug: "binary-tree-basics",
    title: "Binary Tree Basics",
    phase: 10,
    description:
      "Representation, height, node counts and the difference between depth and height.",
    resources: "Binary tree|https://www.geeksforgeeks.org/binary-tree-data-structure/",
  },
  {
    slug: "tree-traversals",
    title: "Traversals (Pre/In/Post/Level)",
    phase: 10,
    description:
      "Recursive and iterative traversals, plus reconstructing a tree from two orders.",
    resources: "Tree traversals|https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/",
  },
  {
    slug: "bst",
    title: "Binary Search Tree",
    phase: 10,
    description:
      "Search/insert/delete, validating a BST, and in-order = sorted order.",
    resources: "BST|https://www.geeksforgeeks.org/binary-search-tree-data-structure/",
  },
  {
    slug: "tree-dfs-bfs",
    title: "DFS & BFS on Trees",
    phase: 10,
    description:
      "Subtree aggregation with DFS and level-order processing with BFS.",
    resources: "CSES Tree Algorithms|https://cses.fi/problemset/",
  },
  {
    slug: "tree-diameter",
    title: "Tree Diameter",
    phase: 10,
    description:
      "Two-BFS method and the single-DFS DP formulation.",
    resources: "Tree diameter|https://cses.fi/problemset/task/1131",
  },
  {
    slug: "lca",
    title: "Lowest Common Ancestor",
    phase: 10,
    description:
      "Binary lifting for O(log n) queries, and Euler tour + sparse table for O(1).",
    resources: cpAlgo("graph/lca_binary_lifting.html", "LCA — binary lifting"),
  },

  // ── Phase 11 — Heap ───────────────────────────────────────
  {
    slug: "heap-basics",
    title: "Min-Heap & Max-Heap",
    phase: 11,
    description:
      "The heap property, array representation, sift-up and sift-down.",
    resources: "Heap|https://www.geeksforgeeks.org/heap-data-structure/",
  },
  {
    slug: "priority-queue-usage",
    title: "Priority Queue in Practice",
    phase: 11,
    description:
      "Top-K problems, merging k sorted lists, and the lazy-deletion trick.",
    resources:
      "std::priority_queue|https://en.cppreference.com/w/cpp/container/priority_queue",
  },
  {
    slug: "heap-sort",
    title: "Heap Sort & Heapify",
    phase: 11,
    description:
      "Building a heap in O(n) and sorting in-place in O(n log n).",
    resources: "Heap sort|https://www.geeksforgeeks.org/heap-sort/",
  },

  // ── Phase 12 — Graph ──────────────────────────────────────
  {
    slug: "graph-representation",
    title: "Graph Representation",
    phase: 12,
    description:
      "Adjacency list vs matrix, edge lists, and handling directed/weighted variants.",
    resources: cpAlgo("graph/breadth-first-search.html", "Graph basics"),
  },
  {
    slug: "graph-dfs",
    title: "Depth-First Search",
    phase: 12,
    description:
      "Recursive DFS, entry/exit times, and classifying tree/back/forward edges.",
    resources: cpAlgo("graph/depth-first-search.html", "DFS"),
  },
  {
    slug: "graph-bfs",
    title: "Breadth-First Search",
    phase: 12,
    description:
      "Shortest paths on unweighted graphs, multi-source BFS and 0-1 BFS with a deque.",
    resources: cpAlgo("graph/breadth-first-search.html", "BFS"),
  },
  {
    slug: "connected-components",
    title: "Connected Components",
    phase: 12,
    description:
      "Counting components, flood fill on grids, and bipartite checking.",
    resources: "CSES Graph|https://cses.fi/problemset/",
  },
  {
    slug: "cycle-detection",
    title: "Cycle Detection",
    phase: 12,
    description:
      "Colour-based detection in directed graphs and parent-tracking in undirected ones.",
    resources: cpAlgo("graph/finding-cycle.html", "Finding a cycle"),
  },
  {
    slug: "topological-sort",
    title: "Topological Sort",
    phase: 12,
    description:
      "Kahn's algorithm and DFS post-order, plus lexicographically smallest ordering.",
    resources: cpAlgo("graph/topological-sort.html", "Topological sort"),
  },
  {
    slug: "dijkstra",
    title: "Dijkstra's Algorithm",
    phase: 12,
    description:
      "Non-negative weighted shortest paths with a priority queue in O(m log n).",
    resources: cpAlgo("graph/dijkstra_sparse.html", "Dijkstra"),
  },
  {
    slug: "bellman-ford",
    title: "Bellman–Ford",
    phase: 12,
    description:
      "Handling negative edges and detecting negative cycles in O(nm).",
    resources: cpAlgo("graph/bellman_ford.html", "Bellman-Ford"),
  },
  {
    slug: "floyd-warshall",
    title: "Floyd–Warshall",
    phase: 12,
    description:
      "All-pairs shortest paths in O(n³), and its use for transitive closure.",
    resources: "Floyd-Warshall|https://cses.fi/problemset/task/1672",
  },
  {
    slug: "mst",
    title: "Minimum Spanning Tree (Kruskal & Prim)",
    phase: 12,
    description:
      "Cut property, Kruskal with DSU and Prim with a priority queue.",
    resources: cpAlgo("graph/mst_kruskal.html", "Kruskal's MST"),
  },
  {
    slug: "dsu",
    title: "Disjoint Set Union",
    phase: 12,
    description:
      "Union by size/rank with path compression, plus DSU on offline queries.",
    resources: cpAlgo("data_structures/disjoint_set_union.html", "DSU"),
  },
  {
    slug: "scc",
    title: "Strongly Connected Components",
    phase: 12,
    description:
      "Kosaraju and Tarjan, plus building the condensation DAG.",
    resources: cpAlgo("graph/strongly-connected-components.html", "SCC"),
  },
  {
    slug: "bridges-articulation",
    title: "Bridges & Articulation Points",
    phase: 12,
    description:
      "Low-link values from a single DFS to find critical edges and vertices.",
    resources: cpAlgo("graph/bridge-searching.html", "Bridges"),
  },

  // ── Phase 13 — Dynamic Programming ────────────────────────
  {
    slug: "dp-fibonacci",
    title: "DP Intro — Fibonacci & Climbing Stairs",
    phase: 13,
    description:
      "Overlapping subproblems and optimal substructure, on the smallest possible example.",
    resources: "DP intro|https://cses.fi/book/book.pdf",
  },
  {
    slug: "memoization-tabulation",
    title: "Memoisation vs Tabulation",
    phase: 13,
    description:
      "Top-down recursion with a cache vs bottom-up iteration, and space optimisation.",
    resources: "DP patterns|https://codeforces.com/blog/entry/67679",
  },
  {
    slug: "knapsack",
    title: "Knapsack (0/1, Unbounded, Subset Sum)",
    phase: 13,
    description:
      "The canonical DP family — capacity states, the 1D rolling trick and reconstruction.",
    resources: "CSES DP|https://cses.fi/problemset/",
  },
  {
    slug: "lis",
    title: "Longest Increasing Subsequence",
    phase: 13,
    description:
      "O(n²) DP and the O(n log n) patience/binary-search formulation.",
    resources: "LIS|https://cses.fi/problemset/task/1145",
  },
  {
    slug: "lcs",
    title: "Longest Common Subsequence & Edit Distance",
    phase: 13,
    description:
      "Two-sequence grid DP, path reconstruction and the edit distance variant.",
    resources: "Edit distance|https://cses.fi/problemset/task/1639",
  },
  {
    slug: "grid-dp",
    title: "Grid & Path DP",
    phase: 13,
    description:
      "Counting paths, minimum path sum, and DP over 2D states with obstacles.",
    resources: "Grid paths|https://cses.fi/problemset/task/1638",
  },
  {
    slug: "digit-dp",
    title: "Digit DP",
    phase: 13,
    description:
      "Counting numbers in a range satisfying a digit predicate, with tight/leading-zero flags.",
    resources: "Digit DP|https://codeforces.com/blog/entry/53960",
  },
  {
    slug: "bitmask-dp",
    title: "Bitmask DP",
    phase: 13,
    description:
      "Subset states for n ≤ 20 — TSP, assignment problems and submask enumeration.",
    resources: "Bitmask DP|https://cses.fi/problemset/task/1690",
  },
  {
    slug: "tree-dp",
    title: "Tree DP",
    phase: 13,
    description:
      "DP over subtrees, rerooting technique, and combining child states.",
    resources: "Tree DP|https://codeforces.com/blog/entry/20935",
  },
  {
    slug: "dp-on-intervals",
    title: "Interval / Range DP",
    phase: 13,
    description:
      "Matrix chain multiplication, burst balloons and O(n³) interval merging.",
    resources: "Interval DP|https://leetcode.com/problems/burst-balloons/",
  },

  // ── Phase 14 — Advanced Topics ────────────────────────────
  {
    slug: "segment-tree",
    title: "Segment Tree",
    phase: 14,
    description:
      "Range queries with point updates, then lazy propagation for range updates.",
    resources: cpAlgo("data_structures/segment_tree.html", "Segment tree"),
  },
  {
    slug: "fenwick-tree",
    title: "Fenwick (Binary Indexed) Tree",
    phase: 14,
    description:
      "Prefix sums with point updates in ~10 lines, plus 2D and range-update variants.",
    resources: cpAlgo("data_structures/fenwick.html", "Fenwick tree"),
  },
  {
    slug: "sparse-table",
    title: "Sparse Table",
    phase: 14,
    description:
      "O(1) idempotent range queries (min/max/gcd) after O(n log n) preprocessing.",
    resources: cpAlgo("data_structures/sparse-table.html", "Sparse table"),
  },
  {
    slug: "trie",
    title: "Trie",
    phase: 14,
    description:
      "Prefix trees for string sets, plus the binary trie for max-XOR queries.",
    resources: "Trie|https://www.geeksforgeeks.org/trie-insert-and-search/",
  },
  {
    slug: "kmp",
    title: "KMP / Prefix Function",
    phase: 14,
    description:
      "Failure function, linear pattern matching and period detection.",
    resources: cpAlgo("string/prefix-function.html", "Prefix function"),
  },
  {
    slug: "z-algorithm",
    title: "Z-Algorithm",
    phase: 14,
    description:
      "Z-array in O(n) and its use for matching and string periodicity.",
    resources: cpAlgo("string/z-function.html", "Z-function"),
  },
  {
    slug: "rabin-karp",
    title: "Rabin–Karp & String Hashing",
    phase: 14,
    description:
      "Polynomial hashing, double hashing against anti-tests, and substring comparison in O(1).",
    resources: cpAlgo("string/string-hashing.html", "String hashing"),
  },
  {
    slug: "bit-manipulation",
    title: "Bit Manipulation",
    phase: 14,
    description:
      "Masks, __builtin_popcount, lowbit, submask enumeration and XOR properties.",
    resources: "Bit tricks|https://codeforces.com/blog/entry/73490",
  },
  {
    slug: "meet-in-the-middle",
    title: "Meet in the Middle",
    phase: 14,
    description:
      "Splitting n ≤ 40 into halves and combining with sorting or binary search.",
    resources: "Meet in the middle|https://cses.fi/problemset/task/1628",
  },
  {
    slug: "matrix-exponentiation",
    title: "Matrix Exponentiation",
    phase: 14,
    description:
      "Solving linear recurrences in O(k³ log n) via fast matrix power.",
    resources: "Matrix exponentiation|https://codeforces.com/blog/entry/67776",
  },
  {
    slug: "computational-geometry",
    title: "Computational Geometry",
    phase: 14,
    description:
      "Cross products, orientation tests, convex hull and line intersection.",
    resources: cpAlgo("geometry/convex-hull.html", "Convex hull"),
  },
  {
    slug: "network-flow",
    title: "Network Flow",
    phase: 14,
    description:
      "Max-flow via Dinic, min-cut duality and bipartite matching as a flow problem.",
    resources: cpAlgo("graph/dinic.html", "Dinic's algorithm"),
  },
  {
    slug: "fft",
    title: "Fast Fourier Transform",
    phase: 14,
    description:
      "Polynomial multiplication in O(n log n), and NTT for modular convolution.",
    resources: cpAlgo("algebra/fft.html", "FFT"),
  },
];

// ── Monthly goals ────────────────────────────────────────────

export const MONTHLY_GOALS = [
  {
    month: 1,
    title: "Foundations",
    focus: "C++ / STL / Mathematics",
    description:
      "Get fluent with the language and the standard library. Grind easy Codeforces problems until syntax stops being the bottleneck.",
    target: 120,
  },
  {
    month: 2,
    title: "Core Techniques",
    focus: "Searching / Two Pointers / Sorting",
    description:
      "Binary search on the answer, sliding windows and prefix sums — the techniques that appear in almost every Div. 2 A–C.",
    target: 100,
  },
  {
    month: 3,
    title: "Problem-Solving Patterns",
    focus: "Recursion / Backtracking / Greedy",
    description:
      "Learn to recognise when a greedy choice is provably safe, and when you need exhaustive search with pruning.",
    target: 90,
  },
  {
    month: 4,
    title: "Linear Structures",
    focus: "Stack / Queue / Linked List / Heap",
    description:
      "Monotonic stacks and priority queues — the data structures that turn O(n²) scans into O(n log n).",
    target: 80,
  },
  {
    month: 5,
    title: "Non-Linear Structures",
    focus: "Trees / Graphs",
    description:
      "Traversals, shortest paths, DSU and MST. This is where ratings above 1400 are won.",
    target: 150,
  },
  {
    month: 6,
    title: "Mastery",
    focus: "Dynamic Programming / Advanced",
    description:
      "DP in all its forms, plus segment trees and string algorithms. Start doing full virtual contests weekly.",
    target: 200,
  },
];

// ── Codeforces rating roadmap ────────────────────────────────

export const RATING_NODES = [
  {
    rating: 800,
    title: "Newbie",
    focus: "Basic Math & Implementation",
    skills: "I/O,Conditionals,Loops,Simple math,Ad-hoc",
  },
  {
    rating: 900,
    title: "Arrays & Strings",
    focus: "Array and string manipulation",
    skills: "Array traversal,Frequency counting,String basics,Simulation",
  },
  {
    rating: 1000,
    title: "STL Fluency",
    focus: "Standard template library",
    skills: "vector,map,set,sort,pair,priority_queue",
  },
  {
    rating: 1100,
    title: "Binary Search",
    focus: "Search and monotone predicates",
    skills: "Binary search,lower_bound,Search on answer,Two pointers",
  },
  {
    rating: 1200,
    title: "Prefix Sum",
    focus: "Precomputation techniques",
    skills: "Prefix sums,Difference arrays,Sliding window,Sorting + greedy",
  },
  {
    rating: 1300,
    title: "Constructives",
    focus: "Constructive algorithms",
    skills: "Pattern finding,Invariants,Parity,Case analysis",
  },
  {
    rating: 1400,
    title: "Graphs",
    focus: "Graph traversal",
    skills: "DFS,BFS,Components,Bipartite,Flood fill,Topo sort",
  },
  {
    rating: 1500,
    title: "Trees & DSU",
    focus: "Tree algorithms and union-find",
    skills: "Tree DFS,Diameter,DSU,MST,Kruskal",
  },
  {
    rating: 1600,
    title: "Dynamic Programming",
    focus: "Classic DP",
    skills: "Knapsack,LIS,LCS,Grid DP,Digit DP",
  },
  {
    rating: 1800,
    title: "Advanced",
    focus: "Specialised structures and techniques",
    skills: "Segment tree,Fenwick,Bitmask DP,Tree DP,String hashing,Dijkstra",
  },
];

// ── Derived helpers ──────────────────────────────────────────

export const PHASE_BY_NUMBER = new Map(PHASES.map((p) => [p.phase, p]));

export function phaseMeta(phase: number): PhaseMeta {
  return (
    PHASE_BY_NUMBER.get(phase) ?? {
      phase,
      title: `Phase ${phase}`,
      subtitle: "",
      target: null,
      accent: "#3b82f6",
    }
  );
}

export function parseResources(raw: string | null | undefined) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split("|");
      return { label: label?.trim() ?? "", url: url?.trim() ?? "" };
    })
    .filter((r) => r.label && r.url);
}
