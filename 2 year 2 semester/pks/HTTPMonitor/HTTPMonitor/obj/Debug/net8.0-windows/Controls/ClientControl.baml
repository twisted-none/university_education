   M S B A M L   `   `   `  ����F  BHTTPMonitor, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null;"clr-namespace:HTTPMonitor.ControlsHTTPMonitor.Controls  5      (    "HTTPMonitor.Controls.ClientControl   5      W SPresentationCore, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35e aSystem.Windows.Controls.Ribbon, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089R NWindowsBase, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35F 9http://schemas.microsoft.com/winfx/2006/xaml/presentation     5      R NSystem.Xaml, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     5      Jmc;http://schemas.openxmlformats.org/markup-compatibility/2006     5      @d2http://schemas.microsoft.com/expression/blend/2008     5      4local"clr-namespace:HTTPMonitor.Controls     5      .��5	      �   � RowDefinitions  5
   
   �� 5      $
��Auto �6   �� 5      $
��Auto �6   �� 5      $
��Auto �6   �� 5      $��* �6   �� 5      $��* �6   .+�5   
   � $��0��6   $��
10,10,10,5q�6    � ColumnDefinitions 5      �� 5      $
��Auto �6#   �� 5      $��* �6#   .+�5      �� $��0��6   $
��URL:��6(   $��Center=�64   $��0,0,10,0q�6O   �� 5      -   5         ��Name$ 
UrlTextBox��5      $��1��6*   $��http://localhost:8080��6:   5      � 5   
   $��1��6   $��	10,5,10,5q�6    5      �� 5      $
��Auto �6#   �� 5       $��* �6#   �� 5!      $
��Auto �6#   .+�5#      �� $��0��6   $��Method:��6(   $��Center=�67   $��0,0,10,0q�6R   �� 5$      -   5         ��Name$ MethodComboBox��5$      $��1��6/    �� SelectedIndex$ 0��6?   .@�5%      �� $	��GET��6   �� 5&      $
��POST��6   5'      �� 5(      -   5         ��Name$ SendRequestButton��5(      $��2��60   $��Send Request��6@   $	��100��6w   $��10,0,0,0q�6�   5)      �� 5,   
   $��2��6   $��Request Body (JSON)��6    $��	10,5,10,5q�6=   .��5-      �� -   5        $ RequestBodyTextBox��5-       �� TextWrapping$
 Wrap=�62    �� AcceptsReturn$
 True��6F   $	��100��6[   ${�False��6h   .��6z   )'{ "Message": "This is a test message" }51      52      �� 55   
   $��3��6   $��Response��6    $��
10,5,10,10q�62   .��56      �� -   5        $ ResponseTextBox��56       �� 
IsReadOnly$
 True��6/   $
 Wrap=�6A   "	 �� VerticalScrollBarVisibility$
	 Auto=�6U   57      �� 5:   
   $��4��6   $��Quick Links��6    $��
10,5,10,10q�65   .��5;      �� .+�5<      �� -   5        $ ��Get JSON Placeholder Posts��5<      $��0,5,0,5q�6d   �� 5=      -   5        $"��Post Message to Local Server��5=      $��0,5,0,5q�6`   �� 5>      -   5        $��Get Server Status��5>      $��0,5,0,5q�6S   5?      5@      5A      5B      