# а) Проверка на равенство списков L1 и L2
def are_linked_lists_equal(L1, L2):
    while L1 is not None and L2 is not None:
        if L1.data != L2.data:
            return False
        L1 = L1.next
        L2 = L2.next
    return L1 is None and L2 is None

# б) Проверка, входят ли все элементы списка L1 в список L2
def all_elements_in_L1_in_L2(L1, L2):
    while L1 is not None:
        if L1.data not in [node.data for node in L2]:
            return False
        L1 = L1.next
    return True

# в) Проверка, есть ли в списке L1 хотя бы два одинаковых элемента
def has_duplicate_elements(L1):
    seen = set()
    while L1 is not None:
        if L1.data in seen:
            return True
        seen.add(L1.data)
        L1 = L1.next
    return False

# г) Перенос в конец непустого списка L1 его первого элемента
def move_first_element_to_end(L1):
    if L1 is not None and L1.next is not None:
        temp = L1.data
        L1 = L1.next
        current = L1
        while current.next is not None:
            current = current.next
        current.next = Node(temp)
    return L1

# д) Перенос в начало непустого списка L1 его последнего элемента
def move_last_element_to_beginning(L1):
    if L1 is not None and L1.next is not None:
        current = L1
        while current.next.next is not None:
            current = current.next
        temp = current.next.data
        current.next = None
        new_node = Node(temp)
        new_node.next = L1
        L1 = new_node
    return L1

# е) Добавление в конец списка L1 всех элементов списка L2
def append_list(L1, L2):
    if L1 is None:
        return L2
    current = L1
    while current.next is not None:
        current = current.next
    current.next = L2
    return L1

# ж) Переворот списка L1
def reverse_list(L1):
    prev = None
    current = L1
    while current is not None:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    L1 = prev
    return L1

# з) Оставление в списке L только первых вхождения одинаковых элементов
def keep_first_occurrence(L):
    seen = set()
    prev = None
    current = L
    while current is not None:
        if current.data in seen:
            prev.next = current.next
        else:
            seen.add(current.data)
            prev = current
        current = current.next
    return L