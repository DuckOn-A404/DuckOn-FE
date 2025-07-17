# 1주차 정리 

## 역할 분담

1. BackEnd
2. 발표 영상 제작

## 역할 수행

### 팀 활동

1. 그라운드 룰 설정
2. 아이디어 회의 참여
3. 아이디어 구체화
4. 기능명세서 구체화
5. 운영 정책 구체화

### 백엔드 개발

- 영상공유 레퍼런스 체크
    - i-Frame api  + WebSocket :
        - 유튜브, 트위치 등의 영상을 공유하여 시청하려는 경우
        - i-frame으로 화면에 영상 재생
        - WebSocket으로 동일 방 내부 유저 간 영상 재생 정보 공유 → 동기화하여 동시 시청
        - 유튜브의 경우 영상을 서버로 전송, 저장하는 행위가 저작권 정책 상 불가능하여 위 방법 선택
    - 스트리밍 서버 :
        - 사용자가 mp4 파일 등 영상 파일 자체를 업로드하여 공유하려 하는 경우
        - 서버로 영상파일 전송, 서버에서 동일 방 내부 모든 유저에게 영상 데이터 브로드캐스팅으로 전송
- 실시간 채팅 레퍼런스 체크
    - WebSocket + stomp 사용하여 pub/sub 기능으로 같은 방 내 모든 사용자간 실시간 채팅 수행
    - 과거 구현한 경험이 있어서 참고예정
    - 시청 방은 영속적이지 않기 때문에 채팅 내역 DB에 따로 저장할 필요가 없음

### 추가 수행

- 과거 구현한 1 : 1 실시간 채팅방 vue 파일 공유
    - 1학기 관통 프로젝트에서 구현한 1 : 1 채팅 기능 프론트엔드 코드 공유
        
        ```jsx
        
        <template>
          <div class="fixed bottom-20 right-6 w-96 h-[500px] bg-base-100 shadow-xl rounded-xl z-50 flex flex-col">
            <div class="flex justify-between items-center p-3 border-b">
              <div class="font-bold"> {{ targetMno }} 님</div>
              <button class="btn btn-xs btn-outline" @click="$emit('close')">닫기 ✕</button>
            </div>
        
            <div ref="chatContainer" class="flex-1 overflow-y-auto p-3 space-y-2 text-sm" @scroll="handleScroll">
              <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="msg.senderMno === myMno ? 'text-right' : 'text-left'"
              >
                <div class="text-xs text-gray-500">{{ msg.senderMno }}</div>
                <div
                  class="inline-block px-3 py-2 rounded-lg max-w-[75%] break-words"
                  :class="msg.senderMno === myMno ? 'bg-blue-200' : 'bg-gray-200'"
                >
                  {{ msg.message }}
                </div>
              </div>
            </div>
        
            <div class="p-3 border-t flex gap-2">
              <input
                v-model="inputMessage"
                class="flex-1 input input-bordered input-sm"
                @keyup.enter="sendMessage"
                placeholder="메시지를 입력하세요"
              />
              <button class="btn btn-sm btn-primary" @click="sendMessage" :disabled="!inputMessage.trim()">전송</button>
            </div>
          </div>
        </template>
        
        <script setup lang="ts">
        import { ref, onMounted, onUnmounted } from "vue";
        import { Client } from "@stomp/stompjs";
        import { useUserStore } from "@/stores/user";
        import axios from "@/apis/axios";
        import { createStompClient } from "@/apis/stomp";
        
        interface ChatMessage {
          roomId: number;
          senderMno: number;
          message: string;
          timestamp?: string;
          type?: "CHAT" | "ENTER" | "LEAVE";
        }
        
        const props = defineProps<{ roomId: number; targetMno: number }>();
        const emit = defineEmits(["close"]);
        
        const userStore = useUserStore();
        const myMno = userStore.user?.mno as number;
        const messages = ref<ChatMessage[]>([]);
        const inputMessage = ref("");
        const chatContainer = ref<HTMLElement | null>(null);
        
        let stompClient: Client | null = null;
        const isConnected = ref(false);
        
        const limit = 20;
        let offset = 0;
        let loading = false;
        
        const fetchInitialMessages = async () => {
          try {
            const token = localStorage.getItem("token");
            const start = performance.now();
        
            const res = await axios.get<ChatMessage[]>("/chat/messages", {
              params: { roomId: props.roomId },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
        
            const end = performance.now();
            const duration = Math.round(end - start);
            console.log(`/chat/messages 응답 시간: ${duration}ms`);
        
            // 클라이언트 응답 시간 측정 결과 전송
            /*
            await axios.post(
              "/metrics/client",
              {
                endpoint: "/chat/messages",
                method: "GET",
                duration,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            */
            messages.value = res.data;
            offset = res.data.length;
            scrollToBottom();
          } catch (err) {
            console.error("채팅 메시지 불러오기 실패:", err);
          }
        };
        
        const fetchOlderMessages = async () => {
          if (loading || offset === 0) return;
          loading = true;
          try {
            const token = localStorage.getItem("token");
            const start = performance.now();
        
            const res = await axios.get<ChatMessage[]>("/chat/messages/paged", {
              params: {
                roomId: props.roomId,
                offset,
                limit,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
        
            const end = performance.now();
            const duration = Math.round(end - start);
            console.log(`/chat/messages/paged 응답 시간: ${duration}ms`);
        
            // 클라이언트 응답 시간 측정 결과 전송
            /*
            await axios.post(
              "/metrics/client",
              {
                endpoint: "/chat/messages/paged",
                method: "GET",
                duration,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            */
        
            messages.value = [...res.data, ...messages.value];
            offset += res.data.length;
          } catch (err) {
            console.error("과거 메시지 로딩 실패:", err);
          } finally {
            loading = false;
          }
        };
        
        const handleScroll = () => {
          if (chatContainer.value && chatContainer.value.scrollTop === 0) {
            fetchOlderMessages();
          }
        };
        
        const scrollToBottom = () => {
          setTimeout(() => {
            chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight, behavior: "smooth" });
          }, 50);
        };
        
        const connectWebSocket = () => {
          const token = localStorage.getItem("token");
          if (!token) return;
        
          stompClient = createStompClient({
            token,
            roomId: props.roomId,
            onMessage: (msg) => {
              messages.value.push(JSON.parse(msg.body));
              scrollToBottom();
            },
            onConnect: () => {
              isConnected.value = true;
            },
          });
        
          stompClient.activate();
        };
        
        const sendMessage = () => {
          if (!inputMessage.value.trim() || !stompClient || !isConnected.value) return;
          const msg: ChatMessage = {
            roomId: props.roomId,
            senderMno: myMno,
            message: inputMessage.value.trim(),
            type: "CHAT",
            timestamp: new Date().toISOString(),
          };
          stompClient.publish({ destination: `/app/chat/${props.roomId}`, body: JSON.stringify(msg) });
          inputMessage.value = "";
        };
        
        onMounted(() => {
          fetchInitialMessages();
          connectWebSocket();
        });
        
        onUnmounted(() => {
          stompClient?.deactivate();
        });
        </script>
        
        <style scoped>
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        </style>
        
        ```